const {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    validateToken,
} = require('../controllers/authController');
const { query } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

jest.mock('../config/database');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('Auth Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            user: { id: 1 },
        };
        res = {
            json: jest.fn(),
            status: jest.fn(() => res),
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        beforeEach(() => {
            req.body = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                user_type: 'buyer',
            };
            query.mockResolvedValue({ rows: [] }); // existing user check
            bcrypt.hash.mockResolvedValue('hashedpassword');
            jwt.sign.mockReturnValue('testtoken');
        });

        it('should register a new user', async () => {
            const newUser = { id: 1, ...req.body };
            query.mockResolvedValueOnce({ rows: [] });
            query.mockResolvedValueOnce({ rows: [newUser] });

            await register(req, res);

            expect(query).toHaveBeenCalledWith('SELECT id FROM users WHERE email = $1', ['test@example.com']);
            expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(query).toHaveBeenCalledWith(expect.stringContaining('INSERT INTO users'), expect.any(Array));
            expect(jwt.sign).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Usuário registrado com sucesso',
                user: expect.any(Object),
                token: 'testtoken',
            });
        });

        it('should return 400 if required fields are missing', async () => {
            req.body = {};

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Campos obrigatórios: name, email, password, user_type' });
        });

        it('should return 400 for invalid user_type', async () => {
            req.body.user_type = 'invalid';

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'user_type deve ser "buyer" ou "supplier"' });
        });

        it('should return 400 for invalid email format', async () => {
            req.body.email = 'invalid-email';

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Email inválido' });
        });

        it('should return 400 for short password', async () => {
            req.body.password = '123';

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Senha deve ter no mínimo 6 caracteres' });
        });

        it('should return 409 if email already exists', async () => {
            query.mockResolvedValue({ rows: [{ id: 1 }] });

            await register(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({ error: 'Email já cadastrado' });
        });
    });

    describe('login', () => {
        beforeEach(() => {
            req.body = {
                email: 'test@example.com',
                password: 'password123',
            };
            const user = { id: 1, email: 'test@example.com', password_hash: 'hashedpassword' };
            query.mockResolvedValue({ rows: [user] });
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('testtoken');
        });

        it('should login a user', async () => {
            await login(req, res);

            expect(query).toHaveBeenCalledWith(expect.stringContaining('SELECT id, name, email'), ['test@example.com']);
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
            expect(jwt.sign).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                message: 'Login realizado com sucesso',
                user: expect.any(Object),
                token: 'testtoken',
            });
        });

        it('should return 400 if email or password is missing', async () => {
            req.body = {};

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Email e senha são obrigatórios' });
        });

        it('should return 401 for incorrect credentials (user not found)', async () => {
            query.mockResolvedValue({ rows: [] });

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Email ou senha incorretos' });
        });

        it('should return 401 for incorrect credentials (wrong password)', async () => {
            bcrypt.compare.mockResolvedValue(false);

            await login(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Email ou senha incorretos' });
        });
    });

    describe('getProfile', () => {
        it('should return the profile of the authenticated user', async () => {
            const userProfile = { id: 1, name: 'Test User' };
            query.mockResolvedValue({ rows: [userProfile] });

            await getProfile(req, res);

            expect(query).toHaveBeenCalledWith(expect.stringContaining('SELECT id, name, email'), [1]);
            expect(res.json).toHaveBeenCalledWith({ user: userProfile });
        });

        it('should return 404 if user not found', async () => {
            query.mockResolvedValue({ rows: [] });

            await getProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Usuário não encontrado' });
        });
    });

    describe('updateProfile', () => {
        it('should update the user profile', async () => {
            req.body = { name: 'Updated Name' };
            const updatedUser = { id: 1, name: 'Updated Name' };
            query.mockResolvedValue({ rows: [updatedUser] });

            await updateProfile(req, res);

            expect(query).toHaveBeenCalledWith(expect.stringContaining('UPDATE users'), ['Updated Name', 1]);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Perfil atualizado com sucesso',
                user: updatedUser,
            });
        });

        it('should return 400 if no fields to update', async () => {
            req.body = {};

            await updateProfile(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Nenhum campo para atualizar' });
        });
    });

    describe('changePassword', () => {
        beforeEach(() => {
            req.body = {
                current_password: 'password123',
                new_password: 'newpassword123',
            };
            const user = { password_hash: 'hashedpassword' };
            query.mockResolvedValueOnce({ rows: [user] });
            bcrypt.compare.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue('newhashedpassword');
            query.mockResolvedValueOnce({ rows: [] });
        });

        it('should change the user password', async () => {
            await changePassword(req, res);

            expect(query).toHaveBeenCalledWith('SELECT password_hash FROM users WHERE id = $1', [1]);
            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedpassword');
            expect(bcrypt.hash).toHaveBeenCalledWith('newpassword123', 10);
            expect(query).toHaveBeenCalledWith(expect.stringContaining('UPDATE users SET password_hash'), ['newhashedpassword', 1]);
            expect(res.json).toHaveBeenCalledWith({ message: 'Senha alterada com sucesso' });
        });

        it('should return 400 if passwords are missing', async () => {
            req.body = {};

            await changePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Senha atual e nova senha são obrigatórias' });
        });

        it('should return 400 for short new password', async () => {
            req.body.new_password = '123';

            await changePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Nova senha deve ter no mínimo 6 caracteres' });
        });

        it('should return 401 for incorrect current password', async () => {
            bcrypt.compare.mockResolvedValue(false);

            await changePassword(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Senha atual incorreta' });
        });
    });

    describe('validateToken', () => {
        it('should return valid status and user info if token is valid', () => {
            req.user = { id: 1, email: 'test@example.com', user_type: 'buyer' };

            validateToken(req, res);

            expect(res.json).toHaveBeenCalledWith({
                valid: true,
                user: {
                    id: 1,
                    email: 'test@example.com',
                    user_type: 'buyer',
                },
            });
        });
    });
});
