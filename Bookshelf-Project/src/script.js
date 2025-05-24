document.addEventListener('DOMContentLoaded', () => {
  const apiUrl = 'http://localhost:9000/api/books';
  const bookTitleInput = document.getElementById('bookTitle');
  const bookAuthorInput = document.getElementById('bookAuthor');
  const bookYearInput = document.getElementById('bookYear');
  const isReadInput = document.getElementById('isRead');
  const addBookBtn = document.getElementById('addBookBtn');
  const searchTitleInput = document.getElementById('searchTitle');
  const searchBookBtn = document.getElementById('searchBookBtn');
  
  const unfinishedBooksList = document.getElementById('unfinishedBooksList');
  const finishedBooksList = document.getElementById('finishedBooksList');

  // Menambahkan Buku
  addBookBtn.addEventListener('click', async () => {
    const newBook = {
      title: bookTitleInput.value,
      author: bookAuthorInput.value,
      year: bookYearInput.value,
      isRead: isReadInput.checked,
    };

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBook),
      });

      const data = await response.json();
      console.log('Buku ditambahkan:', data);
      loadBooks(); // Memuat ulang buku setelah menambahkan
    } catch (error) {
      console.error('Error menambahkan buku:', error);
    }
  });

  // Menampilkan Buku
  async function loadBooks() {
    try {
      const response = await fetch(apiUrl);
      const books = await response.json();

      // Menampilkan buku yang belum selesai dibaca
      unfinishedBooksList.innerHTML = '';
      books.filter(book => !book.isRead).forEach(book => {
        const li = document.createElement('li');
        li.innerHTML = `
          ${book.title} oleh ${book.author} (${book.year})
          <button onclick="markAsRead('${book.title}')">Tandai Selesai</button>
          <button onclick="deleteBook('${book.title}')">Hapus</button>
        `;
        unfinishedBooksList.appendChild(li);
      });

      // Menampilkan buku yang sudah selesai dibaca
      finishedBooksList.innerHTML = '';
      books.filter(book => book.isRead).forEach(book => {
        const li = document.createElement('li');
        li.innerHTML = `
          ${book.title} oleh ${book.author} (${book.year})
          <button onclick="deleteBook('${book.title}')">Hapus</button>
        `;
        finishedBooksList.appendChild(li);
      });

    } catch (error) {
      console.error('Error memuat buku:', error);
    }
  }

  // Menandai Buku sebagai Selesai Dibaca
  async function markAsRead(title) {
    try {
      const response = await fetch(`${apiUrl}/${title}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });

      const data = await response.json();
      console.log('Buku ditandai selesai dibaca:', data);
      loadBooks(); // Memuat ulang buku setelah perubahan
    } catch (error) {
      console.error('Error menandai buku selesai dibaca:', error);
    }
  }

  // Menghapus Buku
  async function deleteBook(title) {
    try {
      const response = await fetch(`${apiUrl}/${title}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      console.log('Buku dihapus:', data);
      loadBooks(); // Memuat ulang buku setelah penghapusan
    } catch (error) {
      console.error('Error menghapus buku:', error);
    }
  }

  // Pencarian Buku
  searchBookBtn.addEventListener('click', async () => {
    const query = searchTitleInput.value;
    try {
      const response = await fetch(`${apiUrl}?title=${query}`);
      const books = await response.json();
      loadBooks(); // Memuat ulang buku setelah pencarian
    } catch (error) {
      console.error('Error pencarian buku:', error);
    }
  });

  loadBooks(); // Memuat buku saat halaman pertama kali dimuat
});
