const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    createNotification,
    createBulkNotifications,
} = require('../controllers/notificationController');
const { query } = require('../config/database');

jest.mock('../config/database');

describe('Notification Controller', () => {
    let req, res;

    beforeEach(() => {
        req = {
            params: {},
            query: {},
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

    describe('getNotifications', () => {
        it('should return a list of notifications for the authenticated user', async () => {
            const mockNotifications = [{ id: 1, message: 'Test Notification' }];
            const mockCount = { total: 1 };
            query.mockResolvedValueOnce({ rows: mockNotifications });
            query.mockResolvedValueOnce({ rows: [mockCount] });

            await getNotifications(req, res);

            expect(query).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                notifications: mockNotifications,
                total: 1,
                limit: 50,
                offset: 0,
            });
        });

        it('should filter notifications by is_read status', async () => {
            req.query.is_read = 'true';
            const mockNotifications = [{ id: 1, message: 'Test Notification', is_read: true }];
            const mockCount = { total: 1 };
            query.mockResolvedValueOnce({ rows: mockNotifications });
            query.mockResolvedValueOnce({ rows: [mockCount] });

            await getNotifications(req, res);

            expect(query).toHaveBeenCalledWith(expect.stringContaining('n.is_read = $2'), [1, true, 50, 0]);
            expect(res.json).toHaveBeenCalledWith({
                notifications: mockNotifications,
                total: 1,
                limit: 50,
                offset: 0,
            });
        });
    });

    describe('getUnreadCount', () => {
        it('should return the count of unread notifications', async () => {
            const mockCount = { unread_count: 5 };
            query.mockResolvedValue({ rows: [mockCount] });

            await getUnreadCount(req, res);

            expect(query).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({ unread_count: 5 });
        });
    });

    describe('markAsRead', () => {
        it('should mark a notification as read', async () => {
            req.params.id = 1;
            const mockNotification = { id: 1, is_read: true };
            query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // check notification
            query.mockResolvedValueOnce({ rows: [mockNotification] }); // update notification

            await markAsRead(req, res);

            expect(query).toHaveBeenCalledWith('SELECT id FROM notifications WHERE id = $1 AND user_id = $2', [1, 1]);
            expect(query).toHaveBeenCalledWith(expect.stringContaining('UPDATE notifications'), [1, 1]);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Notificação marcada como lida',
                notification: mockNotification,
            });
        });

        it('should return 404 if notification not found', async () => {
            req.params.id = 1;
            query.mockResolvedValue({ rows: [] });

            await markAsRead(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Notificação não encontrada' });
        });
    });

    describe('markAllAsRead', () => {
        it('should mark all notifications as read', async () => {
            const mockResult = { rows: [{ id: 1 }, { id: 2 }] };
            query.mockResolvedValue(mockResult);

            await markAllAsRead(req, res);

            expect(query).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                message: 'Todas as notificações foram marcadas como lidas',
                updated_count: 2,
            });
        });
    });

    describe('deleteNotification', () => {
        it('should delete a notification', async () => {
            req.params.id = 1;
            query.mockResolvedValueOnce({ rows: [{ id: 1 }] }); // check notification
            query.mockResolvedValueOnce({ rows: [] }); // delete notification

            await deleteNotification(req, res);

            expect(query).toHaveBeenCalledWith('SELECT id FROM notifications WHERE id = $1 AND user_id = $2', [1, 1]);
            expect(query).toHaveBeenCalledWith('DELETE FROM notifications WHERE id = $1 AND user_id = $2', [1, 1]);
            expect(res.json).toHaveBeenCalledWith({ message: 'Notificação deletada com sucesso' });
        });

        it('should return 404 if notification not found', async () => {
            req.params.id = 1;
            query.mockResolvedValue({ rows: [] });

            await deleteNotification(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ error: 'Notificação não encontrada' });
        });
    });

    describe('deleteAllNotifications', () => {
        it('should delete all notifications for the authenticated user', async () => {
            const mockResult = { rows: [{ id: 1 }, { id: 2 }] };
            query.mockResolvedValue(mockResult);

            await deleteAllNotifications(req, res);

            expect(query).toHaveBeenCalled();
            expect(res.json).toHaveBeenCalledWith({
                message: 'Todas as notificações foram deletadas',
                deleted_count: 2,
            });
        });
    });

    describe('createNotification', () => {
        it('should create a notification', async () => {
            const mockNotification = { id: 1, message: 'Test Notification' };
            query.mockResolvedValue({ rows: [mockNotification] });

            const result = await createNotification(1, 1, 'new_bid', 'Test Notification');

            expect(query).toHaveBeenCalled();
            expect(result).toEqual(mockNotification);
        });
    });

    describe('createBulkNotifications', () => {
        it('should create bulk notifications', async () => {
            const notifications = [
                { user_id: 1, auction_id: 1, type: 'new_bid', message: 'Test 1' },
                { user_id: 2, auction_id: 1, type: 'new_bid', message: 'Test 2' },
            ];
            const mockNotifications = [{ id: 1 }, { id: 2 }];
            query.mockResolvedValue({ rows: mockNotifications });

            const result = await createBulkNotifications(notifications);

            expect(query).toHaveBeenCalled();
            expect(result).toEqual(mockNotifications);
        });
    });
});
