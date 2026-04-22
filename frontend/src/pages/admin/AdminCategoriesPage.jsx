import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import AdminNavbar from "../../components/admin/AdminNavbar";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import api from "../../services/api";

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch categories");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    try {
      setLoading(true);
      await api.post("/categories", { name: newCategory });
      toast.success("Category added successfully");
      setNewCategory("");
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to add category");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim()) return;

    try {
      setLoading(true);
      await api.put(`/categories/${editingCategory._id}`, {
        name: editingCategory.name,
      });
      toast.success("Category updated successfully");
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update category");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    try {
      setLoading(true);
      await api.delete(`/categories/${categoryId}`);
      toast.success("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Manage Categories
          </h1>
          <p className="text-gray-600 mt-2">
            Add, edit, and manage food categories for your menu
          </p>
        </div>

        {/* Add Category Form */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h2>
          </div>
          <form
            onSubmit={editingCategory ? handleUpdate : handleSubmit}
            className="p-6"
          >
            <div className="flex gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={editingCategory ? editingCategory.name : newCategory}
                  onChange={(e) =>
                    editingCategory
                      ? setEditingCategory({
                          ...editingCategory,
                          name: e.target.value,
                        })
                      : setNewCategory(e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter category name"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : editingCategory ? (
                  <>
                    <Edit className="h-4 w-4 mr-2" />
                    Update
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </>
                )}
              </button>
              {editingCategory && (
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Categories List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              All Categories ({categories.length})
            </h2>
          </div>
          <div className="p-6">
            {categories.length === 0 ? (
              <div className="text-center py-8">
                <Tag className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No categories
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Get started by creating a new category.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Tag className="h-5 w-5 text-orange-600 mr-2" />
                        <span className="font-medium text-gray-900">
                          {category.name}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() =>
                            setEditingCategory({
                              _id: category._id,
                              name: category.name,
                            })
                          }
                          className="p-1 text-blue-600 hover:text-blue-700"
                          title="Edit category"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="p-1 text-red-600 hover:text-red-700"
                          title="Delete category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
