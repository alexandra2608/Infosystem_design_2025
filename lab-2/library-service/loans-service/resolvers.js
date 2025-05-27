const db = require('../db');

const mapLoan = (loan) => ({
    id: loan.id,
    memberId: loan.member_id,
    bookId: loan.book_id,
    loanDate: loan.loan_date ? loan.loan_date.toISOString().split('T')[0] : null,
    returnDate: loan.return_date ? loan.return_date.toISOString().split('T')[0] : null,
    status: loan.status,
});

const resolvers = {
    Loan: {
        __resolveReference: async (loanRef) => {
            const res = await db.query('SELECT * FROM loans WHERE id = $1', [loanRef.id]);
            if (!res.rows.length) return null;
            return mapLoan(res.rows[0]);
        },
    },

    Query: {
        loans: async () => {
            const res = await db.query('SELECT * FROM loans');
            return res.rows.map(mapLoan);
        },

        loan: async (_, { id }) => {
            const res = await db.query('SELECT * FROM loans WHERE id = $1', [id]);
            if (!res.rows.length) return null;
            return mapLoan(res.rows[0]);
        },

        loansByMember: async (_, { memberId }) => {
            const res = await db.query('SELECT * FROM loans WHERE member_id = $1', [memberId]);
            return res.rows.map(mapLoan);
        },

        loansByBook: async (_, { bookId }) => {
            const res = await db.query('SELECT * FROM loans WHERE book_id = $1', [bookId]);
            return res.rows.map(mapLoan);
        },
    },

    Mutation: {
        createLoan: async (_, { memberId, bookId, loanDate, status }) => {
            const res = await db.query(
                `INSERT INTO loans (member_id, book_id, loan_date, status)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
                [memberId, bookId, loanDate, status]
            );
            return mapLoan(res.rows[0]);
        },

        updateLoan: async (_, { id, returnDate, status }) => {
            const current = await db.query('SELECT * FROM loans WHERE id = $1', [id]);
            if (!current.rows.length) throw new Error('Loan not found');

            const loan = current.rows[0];
            const updatedReturnDate = returnDate !== undefined ? returnDate : loan.return_date;
            const updatedStatus = status || loan.status;

            const res = await db.query(
                `UPDATE loans
         SET return_date = $1, status = $2
         WHERE id = $3
         RETURNING *`,
                [updatedReturnDate, updatedStatus, id]
            );

            return mapLoan(res.rows[0]);
        },

        deleteLoan: async (_, { id }) => {
            const res = await db.query('DELETE FROM loans WHERE id = $1', [id]);
            return res.rowCount > 0;
        },
    },
};

module.exports = resolvers;
