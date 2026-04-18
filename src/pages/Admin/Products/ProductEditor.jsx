import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase/client';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Save, ArrowLeft } from 'lucide-react';

export default function ProductEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    description: '',
    features: '',
    logo_url: '',
    website_url: '',
    status: 'active',
    order: 0,
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
      if (error) throw error;
      if (data) setFormData(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const productData = {
        ...formData,
        order: parseInt(formData.order) || 0,
        updated_at: new Date().toISOString(),
      };
      if (isEditMode) {
        const { error } = await supabase.from('products').update(productData).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
      }
      navigate('/admin/dashboard/products');
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product');
    } finally {
      setLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['link'],
      ['blockquote', 'code-block'],
      ['clean'],
    ],
  };

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const inputClass = "w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition";

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin/dashboard/products')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditMode ? 'Edit Product' : 'Create New Product'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isEditMode ? 'Update product details' : 'Add a new product to your portfolio'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name *</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} placeholder="Nexora" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tagline *</label>
              <input type="text" required value={formData.tagline} onChange={(e) => setFormData({ ...formData, tagline: e.target.value })} className={inputClass} placeholder="Connect. Create. Thrive Together." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo URL</label>
              <input type="url" value={formData.logo_url} onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })} className={inputClass} placeholder="https://example.com/logo.png" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Website URL</label>
              <input type="url" value={formData.website_url} onChange={(e) => setFormData({ ...formData, website_url: e.target.value })} className={inputClass} placeholder="https://nexora.starstreak.org" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status *</label>
              <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClass}>
                <option value="active">Active (Live Now)</option>
                <option value="coming_soon">Coming Soon</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Display Order</label>
              <input type="number" value={formData.order} onChange={(e) => setFormData({ ...formData, order: e.target.value })} className={inputClass} placeholder="0" />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Lower numbers appear first</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Description *</label>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
              <ReactQuill theme="snow" value={formData.description} onChange={(content) => setFormData({ ...formData, description: content })} modules={modules} className="min-h-[200px]" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features & Highlights *</label>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600">
              <ReactQuill theme="snow" value={formData.features} onChange={(content) => setFormData({ ...formData, features: content })} modules={modules} className="min-h-[250px]" />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Use bullet points for best display</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
            <Save className="w-5 h-5" />
            {loading ? 'Saving...' : (isEditMode ? 'Update Product' : 'Create Product')}
          </button>
          <button type="button" onClick={() => navigate('/admin/dashboard/products')} className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
