const { createAuction, getActiveAuctions, getAuctionById, getBidSuggestion } = require('../controllers/auctionController');
const { query } = require('../config/database');
const aiService = require('../services/aiService');

jest.mock('../config/database');
jest.mock('../services/aiService');

describe('Auction Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {},
            params: {},
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

    describe('createAuction', () => {
        it('should create an auction and return it', async () => {
            req.body = {
                title: 'Test Auction',
                description: 'Test Description',
                category: 'Test Category',
                initial_price: 100,
                end_date: '2025-12-31',
            };
            const mockAuction = { id: 1, ...req.body, buyer_id: 1 };
            query.mockResolvedValue({ rows: [mockAuction] });

            await createAuction(req, res);

            expect(query).toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(mockAuction);
        });

        it('should return 500 on error', async () => {
            query.mockRejectedValue(new Error('Test Error'));

            await createAuction(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Test Error' });
        });
    });

    describe('getActiveAuctions', () => {
        it('should return a list of active auctions', async () => {
            const mockAuctions = [{ id: 1, title: 'Test Auction' }];
            query.mockResolvedValue({ rows: mockAuctions });

            await getActiveAuctions(req, res);

            expect(query).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith(mockAuctions);
        });

        it('should return 500 on error', async () => {
            query.mockRejectedValue(new Error('Test Error'));

            await getActiveAuctions(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Test Error' });
        });
    });

    describe('getAuctionById', () => {
        it('should return an auction by id', async () => {
            req.params.id = 1;
            const mockAuction = { id: 1, title: 'Test Auction' };
            query.mockResolvedValue({ rows: [mockAuction] });

            await getAuctionById(req, res);

            expect(query).toHaveBeenCalledWith('SELECT * FROM auctions WHERE id = $1', [1]);
            expect(res.json).toHaveBeenCalledWith(mockAuction);
        });

        it('should return 404 if auction not found', async () => {
            req.params.id = 1;
            query.mockResolvedValue({ rows: [] });

            await getAuctionById(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Leilão não encontrado' });
        });

        it('should return 500 on error', async () => {
            req.params.id = 1;
            query.mockRejectedValue(new Error('Test Error'));

            await getAuctionById(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Test Error' });
        });
    });

    describe('getBidSuggestion', () => {
        it('should return a bid suggestion', async () => {
            req.params.id = 1;
            aiService.generateStrategicBid.mockResolvedValue(90);

            await getBidSuggestion(req, res);

            expect(aiService.generateStrategicBid).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith({
                auction_id: 1,
                suggestion_amount: 90,
                message: 'Sugestão de lance gerada com sucesso',
            });
        });

        it('should return 404 if no suggestion is available', async () => {
            req.params.id = 1;
            aiService.generateStrategicBid.mockResolvedValue(null);

            await getBidSuggestion(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Leilão não encontrado ou sem dados suficientes para sugestão' });
        });

        it('should return 500 on error', async () => {
            req.params.id = 1;
            aiService.generateStrategicBid.mockRejectedValue(new Error('Test Error'));

            await getBidSuggestion(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Test Error' });
        });
    });
});
