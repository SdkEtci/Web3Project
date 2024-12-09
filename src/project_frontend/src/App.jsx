import React, { useState, useEffect } from 'react';
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory, canisterId } from "../../declarations/project_backend"; 
import bookImage from './book.jpg';
import './index.scss';

const agent = new HttpAgent({ fetch: window.fetch.bind(window), disableCertValidation: true });
const bookTracker = Actor.createActor(idlFactory, { agent, canisterId });

const App = () => {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({ title: "", score: "", comment: "" });
  const [notification, setNotification] = useState(""); // Bildirim durumu
  const [updateBook, setUpdateBook] = useState({ title: "", newComment: "" }); // Güncelleme için state

  // Tüm kitapları backend'den çekme
  const fetchBooks = async () => {
    try {
      const allBooks = await bookTracker.getAllBooks();
      setBooks(allBooks);
      showNotification("Tüm kitaplar başarıyla yüklendi!"); // Bildirim göster
    } catch (error) {
      console.error("Kitaplar alınırken bir hata oluştu:", error);
      showNotification("Kitaplar alınırken bir hata oluştu.");
    }
  };

  // Yeni kitap ekleme
  const addBook = async () => {
    if (!newBook.title || !newBook.score || !newBook.comment) {
      showNotification("Lütfen tüm alanları doldurun!");
      return;
    }

    const score = parseInt(newBook.score);
    if (score < 0 || score > 10) {
      showNotification("Puan 0 ile 10 arasında olmalıdır!");
      return;
    }

    try {
      const addedBook = await bookTracker.addBook(
        newBook.title,
        score,
        newBook.comment
      );
      setBooks((prev) => [...prev, addedBook]); // Yeni eklenen kitabı listeye ekle
      setNewBook({ title: "", score: "", comment: "" }); // Formu sıfırla
      showNotification("Kitap başarıyla eklendi!"); // Başarı bildirimi
    } catch (error) {
      console.error("Kitap eklenirken bir hata oluştu:", error);
      showNotification(`Kitap eklenirken bir hata oluştu: ${error.message || error}`);
    }
  };

  // Kitap silme
  const deleteBook = async (title) => {
    try {
      const success = await bookTracker.deleteBook(title);
      if (success) {
        setBooks(books.filter(book => book.title !== title)); // Silinen kitabı listeden çıkar
        showNotification("Kitap başarıyla silindi!"); // Silme bildirimi
      } else {
        showNotification("Kitap silinemedi. Lütfen tekrar deneyin.");
      }
    } catch (error) {
      console.error("Kitap silinirken bir hata oluştu:", error);
      showNotification("Kitap silinirken bir hata oluştu.");
    }
  };

  // Kitap güncelleme
  const updateBookComment = async () => {
    if (!updateBook.title || !updateBook.newComment) {
      showNotification("Lütfen kitap başlığı ve yeni yorumu girin.");
      return;
    }

    try {
      const updatedBook = await bookTracker.updateBookComment(
        updateBook.title,
        updateBook.newComment
      );
      if (updatedBook) {
        setBooks(books.map(book => 
          book.title === updateBook.title ? updatedBook : book
        )); // Kitap güncellendiğinde listeyi güncelle
        setUpdateBook({ title: "", newComment: "" }); // Formu sıfırla
        showNotification("Kitap başarıyla güncellendi!"); // Başarı bildirimi
      } else {
        showNotification("Kitap bulunamadı. Lütfen doğru başlık girin.");
      }
    } catch (error) {
      console.error("Kitap güncellenirken bir hata oluştu:", error);
      showNotification("Kitap güncellenirken bir hata oluştu.");
    }
  };

  // Bildirim gösterme fonksiyonu
  const showNotification = (message) => {
    setNotification(message); // Bildirim mesajını ayarla
    setTimeout(() => {
      setNotification(""); // 3 saniye sonra bildirim mesajını sıfırla
    }, 3000);
  };

  useEffect(() => {
    fetchBooks(); // Sayfa yüklendiğinde kitapları çek
  }, []);

  return (
    <div className="app">
      <h1>Kitap Takip Uygulaması</h1>

      {/* Yeni Kitap Ekleme Formu */}
      <div className="form">
        <input
          type="text"
          placeholder="Kitap Adı"
          value={newBook.title}
          onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
        />
        <input
          type="number"
          placeholder="Puan (0-10)"
          min="0"
          max="10"
          value={newBook.score}
          onChange={(e) => setNewBook({ ...newBook, score: e.target.value })}
        />
        <input
          type="text"
          placeholder="Yorum"
          value={newBook.comment}
          onChange={(e) => setNewBook({ ...newBook, comment: e.target.value })}
        />
        <button onClick={addBook}>Ekle</button>
      </div>

      {/* Kitap Güncelleme Formu */}
      <div className="form">
        <input
          type="text"
          placeholder="Kitap Başlığı"
          value={updateBook.title}
          onChange={(e) => setUpdateBook({ ...updateBook, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Yeni Yorum"
          value={updateBook.newComment}
          onChange={(e) => setUpdateBook({ ...updateBook, newComment: e.target.value })}
        />
        <button onClick={updateBookComment}>Güncelle</button>
      </div>

      {/* Kitapları Listeleme */}
      <div className="book-list">
        <h2>Kitaplar</h2>
        <button onClick={fetchBooks}>Tüm Kitapları Gör</button>
        <ul>
          {books.length === 0 ? (
            <li>Henüz hiç kitap eklenmedi.</li>
          ) : (
            books.map((book, index) => (
              <li key={index}>
                <img src={bookImage} alt="Book" style={{ width: '50px', height: '50px' }} />
                <strong>{book.title}</strong> - Puan: {book.score}
                <br />
                <span>Yorum: {book.comment}</span>
                <button onClick={() => deleteBook(book.title)}>Sil</button>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Bildirim Gösterimi */}
      {notification && (
        <div className="notification">
          <p>{notification}</p>
        </div>
      )}
    </div>
  );
};

export default App;