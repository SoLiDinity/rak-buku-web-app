const popupElement = document.getElementById("popUp");
const successPopUpElement = document.getElementById("successPopUp");
const deletedPopUpElement = document.getElementById("deletedPopUp");

function hidePopup() {
  popupElement.style.opacity = "0%";
  popupElement.style.zIndex = "-99";
}

function showSuccessPopUp() {
  successPopUpElement.style.top = "30px";
  successPopUpElement.style.opacity = "1";

  setTimeout(function () {
    successPopUpElement.style.top = "0";
    successPopUpElement.style.opacity = "0";
  }, 3000);
}

function showDeletedPopUp() {
  deletedPopUpElement.style.top = "30px";
  deletedPopUpElement.style.opacity = "1";

  setTimeout(function () {
    deletedPopUpElement.style.top = "0";
    deletedPopUpElement.style.opacity = "0";
  }, 3000);
}

function showPopup(bookObject) {
  popupElement.style.opacity = "100%";
  popupElement.style.zIndex = "99";

  const continueDeletionButton = document.getElementById("continueDeletion");
  const cancelDeletionButton = document.getElementById("cancelDeletion");

  continueDeletionButton.addEventListener("click", function () {
    removeBookFromList(bookObject);
    hidePopup();
  });
  cancelDeletionButton.addEventListener("click", function () {
    hidePopup();
    return bookObject = null;
  });
}

const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOKSHELF_APP";

document.addEventListener("DOMContentLoaded", function () {
  const submitData = document.getElementById("form");
  submitData.addEventListener("submit", function (event) {
    event.preventDefault();
    addBookList();
  });
});

function isStorageExist() {
  if (typeof storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
}

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function generateID() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isReaded) {
  return {
    id,
    title,
    author,
    year,
    isReaded,
  };
}

function findBookID(bookID) {
  for (const bookItem of books) {
    if (bookItem.id == bookID) {
      return bookItem;
    }
  }
  return null;
}

function findBookIndex(bookID) {
  for (const index in books) {
    if (books[index].id == bookID) {
      return index;
    }
  }
  return -1;
}

function addBookToFinishedList(bookID) {
  const bookTarget = findBookID(bookID);

  if (bookTarget == null) return;

  bookTarget.isReaded = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  showSuccessPopUp();
  saveData();
}

function addBookToUnfinishedList(bookID) {
  const bookTarget = findBookID(bookID);

  if (bookTarget == null) return;

  bookTarget.isReaded = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  showSuccessPopUp();
  saveData();
}

function removeBookFromList(bookID) {
  const bookTarget = findBookIndex(bookID);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  showDeletedPopUp();
  saveData();
}

document.addEventListener(RENDER_EVENT, function () {
  const unfinishedBookList = document.getElementById("unfinished");
  unfinishedBookList.innerHTML = "";

  const finishedBookList = document.getElementById("finished");
  finishedBookList.innerHTML = "";

  for (const bookItem of books) {
    const bookElement = makeBookList(bookItem);
    if (!bookItem.isReaded) {
      unfinishedBookList.append(bookElement);
    } else {
      finishedBookList.append(bookElement);
    }
  }
});

function addBookList() {
  const bookTitleValue = document.getElementById("bookTitle").value;
  const bookAuthorValue = document.getElementById("bookAuthor").value;
  const bookYearValue = document.getElementById("bookYear").value;

  const generatedID = generateID();
  const bookObject = generateBookObject(
    generatedID,
    bookTitleValue,
    bookAuthorValue,
    bookYearValue,
    false
  );
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function makeBookList(bookObject) {
  const bookTitleElement = document.createElement("h2");
  bookTitleElement.innerText = bookObject.title;

  const bookAuthorElement = document.createElement("p");
  bookAuthorElement.innerText = bookObject.author;

  const bookYearElement = document.createElement("p");
  bookYearElement.innerText = `th. ${bookObject.year}`;

  const bookDataContainer = document.createElement("div");
  bookDataContainer.classList.add("book-data");
  bookDataContainer.append(
    bookTitleElement,
    bookAuthorElement,
    bookYearElement
  );

  const bookListContainer = document.createElement("div");
  bookListContainer.classList.add("book-list");
  bookListContainer.append(bookDataContainer);
  bookListContainer.setAttribute("id", `book-${bookObject.id}`);

  if (bookObject.isReaded) {
    const unreadIcon = document.createElement("i");
    unreadIcon.classList.add("fa-solid");
    unreadIcon.classList.add("fa-trash-can-arrow-up");

    const trashIcon = document.createElement("i");
    trashIcon.classList.add("fa-solid");
    trashIcon.classList.add("fa-trash-can");

    const unreadButtonElement = document.createElement("button");
    unreadButtonElement.append(unreadIcon);
    unreadButtonElement.classList.add("unreaded-button");
    unreadButtonElement.addEventListener("click", function () {
      addBookToUnfinishedList(bookObject.id);
    });

    const deleteButtonElement = document.createElement("button");
    deleteButtonElement.append(trashIcon);
    deleteButtonElement.classList.add("permanent-delete-button");
    deleteButtonElement.addEventListener("click", function () {
      showPopup(bookObject.id);
    });

    const actionButtonsContainer = document.createElement("div");
    actionButtonsContainer.classList.add("action-buttons");
    actionButtonsContainer.append(unreadButtonElement, deleteButtonElement);

    bookListContainer.append(actionButtonsContainer);
  } else {
    const checkIcon = document.createElement("i");
    checkIcon.classList.add("fa-solid");
    checkIcon.classList.add("fa-square-check");

    const trashIcon = document.createElement("i");
    trashIcon.classList.add("fa-solid");
    trashIcon.classList.add("fa-trash-can");

    const checkButtonElement = document.createElement("button");
    checkButtonElement.append(checkIcon);
    checkButtonElement.classList.add("readed-button");
    checkButtonElement.addEventListener("click", function () {
      addBookToFinishedList(bookObject.id);
    });

    const deleteButtonElement = document.createElement("button");
    deleteButtonElement.append(trashIcon);
    deleteButtonElement.classList.add("permanent-delete-button");
    deleteButtonElement.addEventListener("click", function () {
      showPopup(bookObject.id);
    });

    const actionButtonsContainer = document.createElement("div");
    actionButtonsContainer.classList.add("action-buttons");
    actionButtonsContainer.append(checkButtonElement, deleteButtonElement);

    bookListContainer.append(actionButtonsContainer);
  }

  return bookListContainer;
}

if (isStorageExist()) {
  loadDataFromStorage();
}

const searchInput = document.getElementById("search");
searchInput.addEventListener("input", function (e) {
  const value = e.target.value.toLowerCase();
  for (const book of books) {
    const isVisible =
      book.title.toLowerCase().includes(value) ||
      book.author.toLowerCase().includes(value);

    const bookListContainer = document.getElementById(`book-${book.id}`);

    bookListContainer.classList.toggle("hidden", !isVisible);
  }
});