import path from 'path';
import { fileURLToPath } from 'url';
import { nanoid } from 'nanoid';
import Hapi from '@hapi/hapi';
import Inert from '@hapi/inert';  

const server = Hapi.server({
    port: 9000,
    host: 'localhost'
});

await server.register(Inert);

server.ext('onPreResponse', (request, h) => {
    const response = request.response;

    if (response.isBoom) {
        console.error(response);
        return h.response({
            statusCode: response.output.statusCode,
            error: response.output.payload.error,
            message: response.output.payload.message
        }).code(response.output.statusCode);
    }

    return h.continue;
});


// Menggunakan import.meta.url untuk mendapatkan __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Menyajikan file statis (HTML, CSS, JS) dari folder public

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: path.join(__dirname, '..', 'public'),
            index: ['index.html'],
            listing: false,
        }
    }
});


// API POST dan GET untuk buku
let books = []; // Array untuk menyimpan buku
server.route({
    method: 'POST',
    path: '/books',
    handler: (request, h) => {
        const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

        if (!name) {
            return h.response({
                status: 'fail',
                message: 'Gagal menambahkan buku. Mohon isi nama buku',
            }).code(400);
        }
        if (readPage > pageCount) {
            return h.response({
                status: 'fail',
                message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
            }).code(400);
        }

        const finished = pageCount === readPage;

        const newBook = {
            id: nanoid(),
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            finished,
            reading,
            insertedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        books.push(newBook);
        return h.response({
            status: 'success',
            message: 'Buku berhasil ditambahkan',
            data: {
                bookId: newBook.id,
            },
        }).code(201);
    }
});

// Route untuk mendapatkan semua buku
server.route({
    method: 'GET',
    path: '/books',
    handler: (request, h) => {
        if (books.length === 0) {
            return h.response({
                status: "success",
                data: { books: [] },
            }).code(200);
        }

        // Pastikan hanya mengirimkan id, name, dan publisher
        const filteredBooks = books.map(book => ({
            id: book.id,
            name: book.name,
            publisher: book.publisher,
        }));

        return h.response({
            status: "success",
            data: { books: filteredBooks },
        }).code(200);
    }
});


// Route untuk mendapatkan detail buku berdasarkan ID
server.route({
    method: 'GET',
    path: '/books/{bookId}',
    handler: (request, h) => {
        const { bookId } = request.params;
        const book = books.find((b) => b.id === bookId);

        if (!book) {
            return h.response({
                status: "fail",
                message: "Buku tidak ditemukan",
            }).code(404);
        }

        return h.response({
            status: "success",
            data: { book: book },
        }).code(200);
    }
});

// Route untuk memperbarui buku
server.route({
    method: 'PUT',
    path: '/books/{bookId}',
    handler: (request, h) => {
        const { bookId } = request.params;
        const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

        const bookIndex = books.findIndex((b) => b.id === bookId);
        if (bookIndex === -1) {
            return h.response({
                status: "fail",
                message: "Gagal memperbarui buku. Id tidak ditemukan",
            }).code(404);
        }

        if (!name) {
            return h.response({
                status: "fail",
                message: "Gagal memperbarui buku. Mohon isi nama buku",
            }).code(400);
        }

        if (readPage > pageCount) {
            return h.response({
                status: "fail",
                message: "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
            }).code(400);
        }

        const finished = pageCount === readPage;

        books[bookIndex] = {
            ...books[bookIndex],
            name,
            year,
            author,
            summary,
            publisher,
            pageCount,
            readPage,
            finished,
            reading,
            updatedAt: new Date().toISOString(),
        };

        return h.response({
            status: "success",
            message: "Buku berhasil diperbarui",
        }).code(200);
    }
});


// Route untuk menghapus buku
server.route({
    method: 'DELETE',
    path: '/books/{bookId}',
    handler: (request, h) => {
        const { bookId } = request.params;
        const bookIndex = books.findIndex((b) => b.id === bookId);

        if (bookIndex === -1) {
            return h.response({
                status: "fail",
                message: "Buku gagal dihapus. Id tidak ditemukan",
            }).code(404);
        }

        books.splice(bookIndex, 1); // Menghapus buku dari array

        return h.response({
            status: "success",
            message: "Buku berhasil dihapus",
        }).code(200);
    }
});

// Mulai server Hapi
const init = async () => {
    await server.start();
    console.log('Server berjalan di ' + server.info.uri);
};

init();


