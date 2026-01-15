const { createBid, getBidsByAuction, getBidById, getMyBids, withdrawBid, getBidStatistics } = require('../controllers/bidController');
const { query, transaction } = require('../config/database');
const websocket = require('../utils/websocket');
const aiService = require('../services/aiService');

jest.mock('../config/database');
jest.mock('../utils/websocket');
jest.mock('../services/aiService');

describe('Bid Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
            query: {},
            user: { id: 1, user_type: 'supplier' },
        };
        res = {
            json: jest.fn(),
            status: jest.fn(() => res),
        };
        transaction.mockImplementation(async (callback) => {
            const client = {
                query: query,
            };
            return await callback(client);
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createBid', () => {
        beforeEach(() => {
            req.body = {
                auction_id: 1,
                bid_amount: 90,
            };
            aiService.detectBotBehavior.mockResolvedValue(false);
            const auction = { id: 1, buyer_id: 2, initial_price: 100, current_price: 100, end_date: '2025-12-31', status: 'active' };
            const existingBid = { id: 1 };
            const newBid = { id: 2, ...req.body };
            query.mockResolvedValueOnce({ rows: [auction] }); // get auction
            query.mockResolvedValueOnce({ rows: [] }); // get existing bid
            query.mockResolvedValueOnce({ rows: [newBid] }); // create new bid
            query.mockResolvedValueOnce({ rows: [] }); // update auction price
            query.mockResolvedValueOnce({ rows: [] }); // create notification
            query.mockResolvedValueOnce({ rows: [newBid] }); // get full bid
        });

        it('should create a bid and return it', async () => {
            await createBid(req, res);

            expect(aiService.detectBotBehavior).toHaveBeenCalledWith(1, 1);
            expect(transaction).toHaveBeenCalled();
            expect(websocket.broadcast).toHaveBeenCalledWith(1, 'new_bid', expect.any(Object));
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Lance criado com sucesso',
                bid: expect.any(Object),
            });
        });

        it('should return 403 if bot behavior is detected', async () => {
            aiService.detectBotBehavior.mockResolvedValue(true);

            await createBid(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: 'Comportamento suspeito detectado. Por favor, aguarde antes de tentar novamente.',
                message: 'Comportamento suspeito detectado. Por favor, aguarde antes de tentar novamente.',
            });
        });

        it('should return 400 if auction_id or bid_amount is missing', async () => {
            req.body = {};

            await createBid(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'auction_id e bid_amount são obrigatórios' });
        });

        it('should return 400 if bid_amount is not positive', async () => {
            req.body.bid_amount = 0;

            await createBid(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'Valor do lance deve ser maior que zero' });
        });

        it('should return 403 if user is not a supplier', async () => {
            req.user.user_type = 'buyer';

            await createBid(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Apenas fornecedores podem fazer lances' });
        });
    });

    describe('getBidsByAuction', () => {
        it('should return a list of bids for an auction', async () => {
            req.params.auction_id = 1;
            const mockBids = [{ id: 1, auction_id: 1, supplier_id: 1 }];
            query.mockResolvedValue({ rows: mockBids });

            await getBidsByAuction(req, res);

            expect(query).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                bids: expect.any(Array),
                total: 1,
            });
        });

        it('should hide sensitive information from other suppliers', async () => {
            req.params.auction_id = 1;
            req.user.id = 2;
            const mockBids = [{ id: 1, auction_id: 1, supplier_id: 1, bid_amount: 100, created_at: '2025-01-01' }];
            query.mockResolvedValue({ rows: mockBids });

            await getBidsByAuction(req, res);

            expect(res.json).toHaveBeenCalledWith({
                bids: [{
                    id: 1,
                    auction_id: 1,
                    bid_amount: 100,
                    created_at: '2025-01-01',
                    is_mine: false
                }],
                total: 1,
            });
        });
    });

    describe('getBidById', () => {
        it('should return a bid by id', async () => {
            req.params.id = 1;
            const mockBid = { id: 1, supplier_id: 1, buyer_id: 2 };
            query.mockResolvedValue({ rows: [mockBid] });

            await getBidById(req, res);

            expect(query).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ bid: mockBid });
        });

        it('should return 404 if bid not found', async () => {
            req.params.id = 1;
            query.mockResolvedValue({ rows: [] });

            await getBidById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Lance não encontrado' });
        });

        it('should return 403 if user is not the owner or buyer', async () => {
            req.params.id = 1;
            req.user.id = 3;
            const mockBid = { id: 1, supplier_id: 1, buyer_id: 2 };
            query.mockResolvedValue({ rows: [mockBid] });

            await getBidById(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ error: 'Você não tem permissão para ver este lance' });
        });
    });

    describe('getMyBids', () => {
        it('should return a list of bids for the authenticated supplier', async () => {
            const mockBids = [{ id: 1, supplier_id: 1 }];
            query.mockResolvedValue({ rows: mockBids });

            await getMyBids(req, res);

            expect(query).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                bids: mockBids,
                total: 1,
            });
        });
    });

    describe('withdrawBid', () => {
        beforeEach(() => {
            req.params.id = 1;
            const bid = { id: 1, auction_id: 1, supplier_id: 1, bid_amount: 90, auction_status: 'active', current_price: 90 };
            const nextBid = { next_price: 95 };
            query.mockResolvedValueOnce({ rows: [bid] }); // get bid
            query.mockResolvedValueOnce({ rows: [] }); // withdraw bid
            query.mockResolvedValueOnce({ rows: [nextBid] }); // get next bid
            query.mockResolvedValueOnce({ rows: [] }); // update auction price
        });

        it('should withdraw a bid', async () => {
            await withdrawBid(req, res);

            expect(transaction).toHaveBeenCalled();
            expect(websocket.broadcast).toHaveBeenCalledWith(1, 'bid_withdrawn', expect.any(Object));
            expect(res.json).toHaveBeenCalledWith({ message: 'Lance retirado com sucesso' });
        });
    });

    describe('getBidStatistics', () => {
        it('should return bid statistics for an auction', async () => {
            req.params.auction_id = 1;
            const mockStats = { total_bids: 5, lowest_bid: 80, highest_bid: 95, average_bid: 87.5, total_suppliers: 3 };
            query.mockResolvedValue({ rows: [mockStats] });

            await getBidStatistics(req, res);

            expect(query).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ statistics: mockStats });
        });
    });
});
