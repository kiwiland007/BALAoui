
import React, { useState, useEffect, useRef } from 'react';
import type { Product } from '../types';
import { ProductCategory, ProductCondition } from '../types';
import { moroccanCities, sizeOptionsByCategory } from '../constants';
import Button from '../components/ui/Button';

interface AddItemPageProps {
  onAddItem: (product: Omit<Product, 'id' | 'seller' | 'status'>, files: File[]) => void;
  onCancel: () => void;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const AddItemPage: React.FC<AddItemPageProps> = ({ onAddItem, onCancel }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState<ProductCategory>(ProductCategory.Robes);
  const [condition, setCondition] = useState<ProductCondition>(ProductCondition.BonEtat);
  const [size, setSize] = useState('');
  const [city, setCity] = useState('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const availableSizes = sizeOptionsByCategory[category];

  useEffect(() => {
    if (size && (!availableSizes || !availableSizes.includes(size))) {
      setSize('');
    }
  }, [category, size, availableSizes]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles: File[] = [];

      for (const file of newFiles) {
        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          alert(`Type "${file.type}" non supporté.`);
          continue;
        }
        if (file.size > MAX_IMAGE_SIZE) {
          alert(`Fichier trop lourd (max 5MB).`);
          continue;
        }
        validFiles.push(file);
      }

      const combinedFiles = [...files, ...validFiles].slice(0, 5);
      setFiles(combinedFiles);
      setPreviewUrls(combinedFiles.map(f => URL.createObjectURL(f)));
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const newFiles = files.filter((_, index) => index !== indexToRemove);
    setFiles(newFiles);
    setPreviewUrls(newFiles.map(f => URL.createObjectURL(f)));
  };

  const handleDragSort = () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) return;
    const newFiles = [...files];
    const draggedItemContent = newFiles.splice(dragItem.current, 1)[0];
    newFiles.splice(dragOverItem.current, 0, draggedItemContent);
    setFiles(newFiles);
    setPreviewUrls(newFiles.map(f => URL.createObjectURL(f)));
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !city || !category || files.length === 0) {
      alert("Veuillez remplir tous les champs et ajouter au moins une photo.");
      return;
    }
    setIsSubmitting(true);
    try {
      await onAddItem({
        title,
        description,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
        category,
        condition,
        size: size || undefined,
        city,
        images: [], // Will be filled in the parent after upload
      }, files);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonInputClasses = "mt-1 block w-full px-3 py-2 bg-inherit border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all";
  const commonSelectClasses = "mt-1 block w-full pl-3 pr-10 py-2 bg-inherit border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all";

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl stagger-in">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-text-main dark:text-secondary mb-2 text-center">Vends ton article</h1>
        <p className="text-text-light dark:text-gray-400 text-center mb-8">Partage tes trésors avec la communauté BALAoui</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-text-main dark:text-secondary">Photos (jusqu'à 5)</label>
            <div className={`relative group border-2 border-dashed rounded-xl transition-all ${files.length >= 5 ? 'border-gray-200 dark:border-gray-700 opacity-50' : 'border-primary/40 hover:border-primary cursor-pointer bg-primary/5 hover:bg-primary/10'}`}>
              <input
                id="file-upload"
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={files.length >= 5}
              />
              <div className="py-8 text-center flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-cloud-arrow-up text-primary text-xl"></i>
                </div>
                <p className="text-sm font-medium text-text-main dark:text-secondary">Cliquez ou glissez vos photos ici</p>
                <p className="text-xs text-text-light dark:text-gray-500 mt-1">PNG, JPG, WebP jusqu'à 5 Mo</p>
              </div>
            </div>

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-5 gap-3 mt-4">
                {previewUrls.map((url, i) => (
                  <div
                    key={i}
                    className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm transition-all hover:shadow-md cursor-grab active:cursor-grabbing"
                    draggable
                    onDragStart={() => (dragItem.current = i)}
                    onDragEnter={() => (dragOverItem.current = i)}
                    onDragEnd={handleDragSort}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <img src={url} className="w-full h-full object-cover" alt={`Preview ${i + 1}`} />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-lg"
                      >
                        <i className="fa-solid fa-trash-can text-xs"></i>
                      </button>
                    </div>
                    {i === 0 && <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-white text-[10px] text-center py-0.5 font-bold uppercase">Principale</div>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-text-main dark:text-secondary mb-1">Titre de l'annonce</label>
              <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className={commonInputClasses} placeholder="ex: Pantalon Zara bleu marine" required />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-text-main dark:text-secondary mb-1">Description</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={commonInputClasses} placeholder="Décris l'article, ses points forts, pourquoi tu le vends..."></textarea>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="category" className="block text-sm font-semibold text-text-main dark:text-secondary mb-1">Catégorie</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)} className={commonSelectClasses}>
                {Object.values(ProductCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="condition" className="block text-sm font-semibold text-text-main dark:text-secondary mb-1">État</label>
              <select id="condition" value={condition} onChange={(e) => setCondition(e.target.value as ProductCondition)} className={commonSelectClasses}>
                {Object.values(ProductCondition).map(cond => <option key={cond} value={cond}>{cond}</option>)}
              </select>
            </div>
          </div>

          {availableSizes && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-text-main dark:text-secondary">Taille</label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map(s => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSize(s === size ? '' : s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${size === s
                        ? 'bg-primary text-white border-primary shadow-md scale-105'
                        : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-text-main dark:text-secondary hover:border-primary hover:text-primary'
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label htmlFor="price" className="block text-sm font-semibold text-text-main dark:text-secondary mb-1">Prix de vente</label>
              <div className="relative">
                <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} className={`${commonInputClasses} pr-12`} placeholder="0" required />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">MAD</span>
              </div>
            </div>
            <div className="relative opacity-70">
              <label htmlFor="originalPrice" className="block text-sm font-semibold text-text-main dark:text-secondary mb-1">Prix d'origine</label>
              <div className="relative">
                <input type="number" id="originalPrice" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className={`${commonInputClasses} pr-12`} placeholder="Facultatif" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">MAD</span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-semibold text-text-main dark:text-secondary mb-1">Ville de retrait</label>
            <select id="city" value={city} onChange={(e) => setCity(e.target.value)} className={commonSelectClasses} required>
              <option value="">Sélectionnez une ville</option>
              {moroccanCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-6 border-t dark:border-gray-700">
            <Button type="button" variant="ghost" onClick={onCancel} className="h-11 px-8">
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="h-11 px-10 shadow-lg shadow-primary/20 bg-gradient-to-r from-primary to-accent">
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  <span>Publication...</span>
                </div>
              ) : 'Publier l\'annonce'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemPage;