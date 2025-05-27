const db = require('../db');

const resolvers = {
    Member: {
        __resolveReference: async (memberRef) => {
            const res = await db.query('SELECT * FROM members WHERE id = $1', [memberRef.id]);
            const member = res.rows[0];
            if (!member) return null;
            return {
                ...member,
                membershipDate: member.membership_date
                    ? member.membership_date.toISOString().split('T')[0]
                    : null,
            };
        },
    },

    Query: {
        members: async () => {
            const res = await db.query('SELECT * FROM members');
            return res.rows.map(member => ({
                ...member,
                membershipDate: member.membership_date
                    ? member.membership_date.toISOString().split('T')[0]
                    : null,
            }));
        },

        member: async (_, { id }) => {
            const res = await db.query('SELECT * FROM members WHERE id = $1', [id]);
            const member = res.rows[0];
            if (!member) return null;
            return {
                ...member,
                membershipDate: member.membership_date
                    ? member.membership_date.toISOString().split('T')[0]
                    : null,
            };
        },
    },

    Mutation: {
        createMember: async (_, { name, email, phone }) => {
            const res = await db.query(
                `INSERT INTO members (name, email, phone, membership_date)
         VALUES ($1, $2, $3, CURRENT_DATE)
         RETURNING *`,
                [name, email, phone]
            );

            const member = res.rows[0];
            return {
                ...member,
                membershipDate: member.membership_date
                    ? member.membership_date.toISOString().split('T')[0]
                    : null,
            };
        },

        updateMember: async (_, { id, name, email, phone }) => {
            const current = await db.query('SELECT * FROM members WHERE id = $1', [id]);
            if (!current.rows.length) throw new Error('Member not found');

            const member = current.rows[0];
            const newName = name || member.name;
            const newEmail = email || member.email;
            const newPhone = phone || member.phone;

            const res = await db.query(
                `UPDATE members SET name=$1, email=$2, phone=$3 WHERE id=$4 RETURNING *`,
                [newName, newEmail, newPhone, id]
            );
            const updated_member = res.rows[0];
            return {
                ...updated_member,
                membershipDate: updated_member.membership_date
                    ? updated_member.membership_date.toISOString().split('T')[0]
                    : null,
            };
        },

        deleteMember: async (_, { id }) => {
            const res = await db.query('DELETE FROM members WHERE id=$1', [id]);
            return res.rowCount > 0;
        },
    },
};

module.exports = resolvers;
