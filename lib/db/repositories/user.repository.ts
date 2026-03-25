import { User } from '@/models/User';

export const UserRepository = {
    async findById(id: string) {
        return User.findById(id)
            .select('-password -__v')
            .lean();
    },

    async findByUid(uid: string) {
        return User.findOne({ uid })
            .select('-password -__v')
            .lean();
    },

    async findAll() {
        return User.find()
            .select('displayName email role isActive trustLevel createdAt uid')
            .sort({ createdAt: -1 })
            .lean();
    },

    async updateProfile(id: string, data: { displayName?: string; phone?: string; photoURL?: string }) {
        return User.findByIdAndUpdate(
            id,
            { $set: data },
            { new: true }
        ).select('-password -__v').lean();
    },

    async updateRole(id: string, role: string) {
        return User.findByIdAndUpdate(
            id,
            { $set: { role } },
            { new: true }
        ).select('displayName email role').lean();
    },

    async ban(id: string, adminUid: string) {
        return User.findByIdAndUpdate(
            id,
            { $set: { isActive: false, bannedAt: new Date(), bannedBy: adminUid } },
            { new: true }
        ).select('displayName email isActive').lean();
    },

    async unban(id: string) {
        return User.findByIdAndUpdate(
            id,
            { $set: { isActive: true, bannedAt: null, bannedBy: null } },
            { new: true }
        ).select('displayName email isActive').lean();
    },
};
