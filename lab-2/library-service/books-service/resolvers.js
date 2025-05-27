const db = require('../db');

const resolvers = {
    Book: {
        __resolveReference: async (bookRef) => {
            const res = await db.query('SELECT * FROM books WHERE id = $1', [bookRef.id]);
            const book = res.rows[0];
            if (!book) return null;
            return {
                id: book.id,
                title: book.title,
                author: book.author,
                isbn: book.isbn,
                publishedYear: book.published_year,
                copiesAvailable: book.copies_available,
                genre: book.genre,
            };
        }
    },

    Query: {
        books: async () => {
            const res = await db.query('SELECT * FROM books');
            return res.rows.map(book => ({
                id: book.id,
                title: book.title,
                author: book.author,
                isbn: book.isbn,
                publishedYear: book.published_year,
                copiesAvailable: book.copies_available,
                genre: book.genre
            }));
        },

        book: async (_, { id }) => {
            const res = await db.query('SELECT * FROM books WHERE id = $1', [id]);
            const book = res.rows[0];
            if (!book) return null;
            return {
                id: book.id,
                title: book.title,
                author: book.author,
                isbn: book.isbn,
                publishedYear: book.published_year,
                copiesAvailable: book.copies_available,
                genre: book.genre
            };
        },
    },

    Mutation: {
        createBook: async (_, { title, author, isbn, publishedYear, copiesAvailable, genre }) => {
            const res = await db.query(
                `INSERT INTO books (title, author, isbn, published_year, copies_available, genre)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, title, author, isbn, published_year, copies_available, genre`,
                [title, author, isbn, publishedYear, copiesAvailable, genre]
            );
            const book = res.rows[0];
            return {
                id: book.id,
                title: book.title,
                author: book.author,
                isbn: book.isbn,
                publishedYear: book.published_year,
                copiesAvailable: book.copies_available,
                genre: book.genre
            };
        },

        updateBook: async (_, { id, title, author, isbn, publishedYear, copiesAvailable, genre }) => {
            const currentRes = await db.query('SELECT * FROM books WHERE id = $1', [id]);
            if (!currentRes.rows.length) throw new Error('Book not found');

            const book = currentRes.rows[0];

            const newTitle = title || book.title;
            const newAuthor = author || book.author;
            const newIsbn = isbn || book.isbn;
            const newPublishedYear = publishedYear || book.published_year;
            const newCopiesAvailable = copiesAvailable !== undefined ? copiesAvailable : book.copies_available;
            const newGenre = genre || book.genre;

            const res = await db.query(
                `UPDATE books
         SET title=$1, author=$2, isbn=$3, published_year=$4, copies_available=$5, genre=$6
         WHERE id=$7
         RETURNING *`,
                [newTitle, newAuthor, newIsbn, newPublishedYear, newCopiesAvailable, newGenre, id]
            );

            const updated = res.rows[0];
            return {
                id: updated.id,
                title: updated.title,
                author: updated.author,
                isbn: updated.isbn,
                publishedYear: updated.published_year,
                copiesAvailable: updated.copies_available,
                genre: updated.genre
            };
        },

        deleteBook: async (_, { id }) => {
            const res = await db.query('DELETE FROM books WHERE id = $1', [id]);
            return res.rowCount > 0;
        },
    },
};

module.exports = resolvers;
