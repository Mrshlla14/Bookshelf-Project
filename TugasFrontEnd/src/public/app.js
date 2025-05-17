document.addEventListener("DOMContentLoaded", function () {
  const inputBookForm = document.getElementById("inputBook");
  const incompleteBookshelfList = document.getElementById(
    "incompleteBookshelfList"
  );
  const completeBookshelfList = document.getElementById(
    "completeBookshelfList"
  );
  const searchBookTitle = document.getElementById("searchBookTitle");

  inputBookForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  searchBookTitle.addEventListener("input", function (event) {
    searchBook(event.target.value);
  });

  function addBook() {
    const title = document.getElementById("inputBookTitle").value;
    const author = document.getElementById("inputBookAuthor").value;
    const year = parseInt(document.getElementById("inputBookYear").value, 10);
    const isComplete = document.getElementById("inputBookIsComplete").checked;
    const id = +new Date();

    const book = createBook(id, title, author, year, isComplete);
    if (isComplete) {
      completeBookshelfList.appendChild(book);
    } else {
      incompleteBookshelfList.appendChild(book);
    }

    updateDataToStorage();
  }

  function createBook(id, title, author, year, isComplete) {
    const bookContainer = document.createElement("article");
    bookContainer.classList.add("book_item");
    if (isComplete) {
      bookContainer.classList.add("green");
    } else {
      bookContainer.classList.add("red");
    }
    bookContainer.dataset.id = id;

    const bookTitle = document.createElement("h3");
    bookTitle.innerText = title;

    const bookAuthor = document.createElement("p");
    bookAuthor.innerText = "Penulis: " + author;

    const bookYear = document.createElement("p");
    bookYear.innerText = "Tahun: " + year;

    const actionContainer = document.createElement("div");
    actionContainer.classList.add("action");

    const moveButton = document.createElement("button");
    moveButton.innerText = isComplete
      ? "Belum selesai dibaca"
      : "Selesai dibaca";
    moveButton.classList.add(isComplete ? "green" : "red");
    moveButton.addEventListener("click", function () {
      moveBook(id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Hapus buku";
    deleteButton.classList.add("red");
    deleteButton.addEventListener("click", function () {
      deleteBook(id);
    });

    actionContainer.appendChild(moveButton);
    actionContainer.appendChild(deleteButton);

    bookContainer.appendChild(bookTitle);
    bookContainer.appendChild(bookAuthor);
    bookContainer.appendChild(bookYear);
    bookContainer.appendChild(actionContainer);

    return bookContainer;
  }

  function moveBook(id) {
    const bookContainer = document.querySelector(`.book_item[data-id="${id}"]`);
    const isComplete = bookContainer.classList.contains("green");

    const newBook = createBook(
      id,
      bookContainer.querySelector("h3").innerText,
      bookContainer.querySelector("p:nth-of-type(1)").innerText.split(": ")[1],
      bookContainer.querySelector("p:nth-of-type(2)").innerText.split(": ")[1],
      !isComplete
    );

    if (isComplete) {
      incompleteBookshelfList.appendChild(newBook);
    } else {
      completeBookshelfList.appendChild(newBook);
    }

    bookContainer.remove();
    updateDataToStorage();
  }

  function deleteBook(id) {
    const bookContainer = document.querySelector(`.book_item[data-id="${id}"]`);
    bookContainer.remove();
    updateDataToStorage();
  }

  function updateDataToStorage() {
    const incompleteBookshelfData = [];
    const completeBookshelfData = [];

    document.querySelectorAll(".book_item").forEach(function (book) {
      const bookData = {
        id: parseInt(book.dataset.id, 10),
        title: book.querySelector("h3").innerText,
        author: book.querySelector("p:nth-of-type(1)").innerText.split(": ")[1],
        year: parseInt(
          book.querySelector("p:nth-of-type(2)").innerText.split(": ")[1],
          10
        ),
        isComplete: book.classList.contains("green"),
      };

      if (bookData.isComplete) {
        completeBookshelfData.push(bookData);
      } else {
        incompleteBookshelfData.push(bookData);
      }
    });

    localStorage.setItem(
      "incompleteBookshelf",
      JSON.stringify(incompleteBookshelfData)
    );
    localStorage.setItem(
      "completeBookshelf",
      JSON.stringify(completeBookshelfData)
    );
  }

  function loadDataFromStorage() {
    const incompleteBookshelfData = JSON.parse(
      localStorage.getItem("incompleteBookshelf")
    );
    const completeBookshelfData = JSON.parse(
      localStorage.getItem("completeBookshelf")
    );

    if (incompleteBookshelfData !== null) {
      incompleteBookshelfData.forEach(function (book) {
        const newBook = createBook(
          book.id,
          book.title,
          book.author,
          parseInt(book.year, 10),
          false
        );
        incompleteBookshelfList.appendChild(newBook);
      });
    }

    if (completeBookshelfData !== null) {
      completeBookshelfData.forEach(function (book) {
        const newBook = createBook(
          book.id,
          book.title,
          book.author,
          parseInt(book.year, 10),
          true
        );
        completeBookshelfList.appendChild(newBook);
      });
    }
  }

  function searchBook(query) {
    const books = document.querySelectorAll(".book_item");
    books.forEach(function (book) {
      const title = book.querySelector("h3").innerText.toLowerCase();
      if (title.includes(query.toLowerCase())) {
        book.style.display = "block";
      } else {
        book.style.display = "none";
      }
    });
  }

  loadDataFromStorage();
});

function addBook() {
  const title = document.getElementById("inputBookTitle").value;
  const author = document.getElementById("inputBookAuthor").value;
  const year = parseInt(document.getElementById("inputBookYear").value, 10);
  const isComplete = document.getElementById("inputBookIsComplete").checked;

  const bookData = {
    name: title,
    year: year,
    author: author,
    summary: "Summary book", // Anda bisa menambahkan input untuk summary jika diperlukan
    publisher: "Publisher Name", // Anda bisa menambahkan input untuk publisher jika diperlukan
    pageCount: 100, // Anda bisa menambahkan input untuk pageCount jika diperlukan
    readPage: 50, // Anda bisa menambahkan input untuk readPage jika diperlukan
    reading: isComplete, // Menandakan apakah buku sedang dibaca
  };

  fetch("http://localhost:9000/books", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(bookData),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message); // Menampilkan pesan sukses
      loadBooks(); // Muat ulang buku setelah ditambahkan
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function viewBookDetail(bookId) {
  fetch(`http://localhost:9000/books/${bookId}`)
    .then((response) => response.json())
    .then((data) => {
      const book = data.data.book;
      const bookDetailSection = document.getElementById("bookDetail");
      bookDetailSection.innerHTML = `
        <h3>${book.name}</h3>
        <p>Penulis: ${book.author}</p>
        <p>Tahun: ${book.year}</p>
        <p>Ringkasan: ${book.summary}</p>
        <p>Penerbit: ${book.publisher}</p>
        <button onclick="editBook(${book.id})">Edit Buku</button>
      `;
    });
}

// Menambahkan event listener pada tombol "Lihat Detail"
const bookItems = document.querySelectorAll(".book_item");
bookItems.forEach((item) => {
  item.addEventListener("click", () => {
    const bookId = item.dataset.id;
    showBookDetail(bookId);
  });
});

function editBook(bookId) {
  const form = document.getElementById("editBookForm");
  form.style.display = "block";
  form.elements["bookId"].value = bookId;

  // Ambil data buku dan masukkan ke dalam form
  fetch(`http://localhost:9000/books/${bookId}`)
    .then((response) => response.json())
    .then((data) => {
      const book = data.data.book;
      form.elements["name"].value = book.name;
      form.elements["author"].value = book.author;
      form.elements["year"].value = book.year;
      form.elements["summary"].value = book.summary;
      form.elements["publisher"].value = book.publisher;
    });

  form.onsubmit = function (event) {
    event.preventDefault();
    updateBook(bookId);
  };
}

function updateBook(bookId) {
  const form = document.getElementById("editBookForm");
  const updatedBook = {
    name: form.elements["name"].value,
    author: form.elements["author"].value,
    year: form.elements["year"].value,
    summary: form.elements["summary"].value,
    publisher: form.elements["publisher"].value,
    pageCount: 100, // Misalnya, Anda menambahkan input untuk pageCount
    readPage: 50, // Misalnya, Anda menambahkan input untuk readPage
    reading: false, // Misalnya, Anda menambahkan input untuk reading
  };

  fetch(`http://localhost:9000/books/${bookId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updatedBook),
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      loadBooks(); // Muat ulang daftar buku setelah diperbarui
    });
}

function loadBooks() {
  fetch("http://localhost:9000/books")
    .then((response) => response.json())
    .then((data) => {
      const booksList = document.getElementById("bookList");
      booksList.innerHTML = "";
      data.data.books.forEach((book) => {
        const bookElement = document.createElement("div");
        bookElement.innerHTML = `
          <h3>${book.name}</h3>
          <p>Penulis: ${book.author}</p>
          <button onclick="viewBookDetail('${book.id}')">Lihat Detail</button>
        `;
        booksList.appendChild(bookElement);
      });
    });
}

function deleteBook(bookId) {
  fetch(`http://localhost:9000/books/${bookId}`, {
    method: "DELETE",
  })
    .then((response) => response.json())
    .then((data) => {
      alert(data.message);
      loadBooks(); // Muat ulang daftar buku setelah dihapus
    });
}
