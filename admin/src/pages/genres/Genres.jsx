import { useState, useEffect } from "react";
import { genreAPI } from "../../api/genreAPI";
import "../../styles/admin-common.css";

export default function Genres() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingGenre, setEditingGenre] = useState(null);
  const [newGenre, setNewGenre] = useState({
    name: "",
    description: ""
  });

  const fetchGenres = async (page = 1) => {
    try {
      setLoading(true);
      const data = await genreAPI.getAll(page, 10);
      
      if (data.success) {
        setGenres(data.genres);
        setTotalPages(data.pagination.pages);
        setCurrentPage(page);
      } else {
        setError(data.message || "Помилка завантаження жанрів");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Помилка з'єднання з сервером");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGenre = async (e) => {
    e.preventDefault();
    try {
      const data = await genreAPI.create(newGenre);
      
      if (data.success) {
        setShowCreateModal(false);
        setNewGenre({
          name: "",
          description: ""
        });
        fetchGenres(currentPage);
        alert("Жанр успішно створений!");
      } else {
        alert(data.message || "Помилка створення жанру");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Помилка з'єднання з сервером");
    }
  };

  const handleEditGenre = async (e) => {
    e.preventDefault();
    try {
      const data = await genreAPI.update(editingGenre._id, editingGenre);
      
      if (data.success) {
        setShowEditModal(false);
        setEditingGenre(null);
        fetchGenres(currentPage);
        alert("Жанр успішно оновлений!");
      } else {
        alert(data.message || "Помилка оновлення жанру");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Помилка з'єднання з сервером");
    }
  };

  const deleteGenre = async (genreId) => {
    if (!window.confirm("Ви впевнені, що хочете видалити цей жанр?")) {
      return;
    }
    
    try {
      const data = await genreAPI.delete(genreId);
      
      if (data.success) {
        fetchGenres(currentPage);
        alert("Жанр успішно видалений!");
      } else {
        alert(data.message || "Помилка видалення жанру");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Помилка з'єднання з сервером");
    }
  };

  const openEditModal = (genre) => {
    setEditingGenre({ ...genre });
    setShowEditModal(true);
  };

  const filteredGenres = genres.filter(genre => 
    genre.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (genre.description && genre.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString) => {
    if (!dateString) return "Не вказано";
    return new Date(dateString).toLocaleString('uk-UA');
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  const toggleGenreStatus = async (genreId) => {
    try {
      const data = await genreAPI.toggleStatus(genreId);
      
      if (data.success) {
        fetchGenres(currentPage);
        alert(data.message || "Статус жанру успішно змінений!");
      } else {
        alert(data.message || "Помилка зміни статусу жанру");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Помилка з'єднання з сервером");
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1 className="page-title">Управління жанрами</h1>
          </div>
          
          <div className="header-actions">
            <button 
              onClick={() => window.location.href = '/dashboard'}
              className="btn btn-secondary"
            >
              ← Назад до Dashboard
            </button>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div className="page-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder="Пошук жанрів..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn btn-success"
          >
            + Створити жанр
          </button>
        </div>

        {loading ? (
          <div className="loading">Завантаження...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            <div className="data-table">
              <table>
                <thead>
                  <tr>
                    <th>Назва</th>
                    <th>Опис</th>
                    <th>Статус</th>
                    <th>Дата створення</th>
                    <th>Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGenres.map((genre) => (
                    <tr key={genre._id}>
                      <td>
                        <div className="font-weight-bold">{genre.name}</div>
                      </td>
                      <td>
                        <div className="text-secondary">
                          {genre.description || "Опис відсутній"}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${genre.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {genre.isActive ? 'Активний' : 'Неактивний'}
                        </span>
                      </td>
                      <td>{formatDate(genre.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => toggleGenreStatus(genre._id)}
                            className={`action-btn ${genre.isActive ? 'action-btn-delete' : 'action-btn-toggle'}`}
                            title={genre.isActive ? 'Деактивувати жанр' : 'Активувати жанр'}
                          >
                            {genre.isActive ? '🔴' : '🟢'}
                          </button>
                          
                          <button
                            onClick={() => openEditModal(genre)}
                            className="action-btn action-btn-edit"
                            title="Редагувати жанр"
                          >
                            ✏️
                          </button>
                          
                          <button
                            onClick={() => deleteGenre(genre._id)}
                            className="action-btn action-btn-delete"
                            title="Видалити жанр"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <button 
                onClick={() => fetchGenres(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-secondary"
              >
                ← Попередня
              </button>
              
              <span className="pagination-info">
                Сторінка {currentPage} з {totalPages}
              </span>
              
              <button 
                onClick={() => fetchGenres(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-secondary"
              >
                Наступна →
              </button>
            </div>
          </>
        )}
      </div>

      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Створити новий жанр</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleCreateGenre}>
                <div className="form-group">
                  <label className="form-label">Назва жанру *</label>
                  <input
                    type="text"
                    value={newGenre.name}
                    onChange={(e) => setNewGenre({...newGenre, name: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Опис</label>
                  <textarea
                    value={newGenre.description}
                    onChange={(e) => setNewGenre({...newGenre, description: e.target.value})}
                    rows="3"
                    placeholder="Опис жанру (необов'язково)"
                    className="form-textarea"
                  />
                </div>
                
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-secondary">
                    Скасувати
                  </button>
                  <button type="submit" className="btn btn-success">
                    Створити жанр
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingGenre && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Редагувати жанр</h2>
              <button 
                onClick={() => setShowEditModal(false)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={handleEditGenre}>
                <div className="form-group">
                  <label className="form-label">Назва жанру *</label>
                  <input
                    type="text"
                    value={editingGenre.name}
                    onChange={(e) => setEditingGenre({...editingGenre, name: e.target.value})}
                    required
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Опис</label>
                  <textarea
                    value={editingGenre.description || ""}
                    onChange={(e) => setEditingGenre({...editingGenre, description: e.target.value})}
                    rows="3"
                    placeholder="Опис жанру (необов'язково)"
                    className="form-textarea"
                  />
                </div>
                
                <div className="modal-actions">
                  <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                    Скасувати
                  </button>
                  <button type="submit" className="btn btn-success">
                    Зберегти зміни
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}