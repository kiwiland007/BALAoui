
import React, { useState, useEffect, useRef } from 'react';
import type { Product } from '../types';
import { ProductCategory, ProductCondition, ProductStatus } from '../types';
import { moroccanCities, sizeOptionsByCategory } from '../constants';
import Button from '../components/ui/Button';

interface AddItemPageProps {
  onAddItem: (product: Omit<Product, 'id' | 'seller' | 'status'>) => void;
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
  const [images, setImages] = useState<string[]>([]);
  
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const availableSizes = sizeOptionsByCategory[category];

  useEffect(() => {
    // Reset size if the selected category changes and the current size is no longer valid
    if (size && (!availableSizes || !availableSizes.includes(size))) {
        setSize('');
    }
  }, [category, size, availableSizes]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles: File[] = [];

      for (const file of files) {
        // FIX: Cast file to File to access its properties, resolving 'does not exist on type unknown' errors.
        const fileAsFile = file as File;
        if (!ALLOWED_IMAGE_TYPES.includes(fileAsFile.type)) {
          alert(`Le type de fichier "${fileAsFile.name}" n'est pas supporté. Types acceptés: JPG, PNG, GIF, WebP.`);
          continue;
        }
        if (fileAsFile.size > MAX_IMAGE_SIZE) {
          alert(`Le fichier "${fileAsFile.name}" est trop volumineux (max 5MB).`);
          continue;
        }
        // FIX: Push the correctly typed File object to the array.
        validFiles.push(fileAsFile);
      }
      
      const newImageUrls = validFiles.map(file => URL.createObjectURL(file as Blob));
      setImages(prev => [...prev, ...newImageUrls].slice(0, 5));
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const handleDragSort = () => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) return;
    
    const newImages = [...images];
    const draggedItemContent = newImages.splice(dragItem.current, 1)[0];
    newImages.splice(dragOverItem.current, 0, draggedItemContent);
    
    dragItem.current = null;
    dragOverItem.current = null;
    
    setImages(newImages);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !city || !category) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    onAddItem({
      title,
      description,
      price: parseFloat(price),
      originalPrice: originalPrice ? parseFloat(originalPrice) : undefined,
      category,
      condition,
      size: size || undefined,
      city,
      images: images.length > 0 ? images : ['https://picsum.photos/seed/newitem/600/800'], // Placeholder if no image
    });
  };
  
  const commonInputClasses = "mt-1 block w-full px-3 py-2 bg-inherit border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary";
  const commonSelectClasses = "mt-1 block w-full pl-3 pr-10 py-2 bg-inherit border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary";

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold text-text-main dark:text-secondary mb-6 text-center">Vends ton article</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-main dark:text-secondary mb-2">Photos (jusqu'à 5)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg">
              <div className="space-y-1 text-center">
                <i className="fa-solid fa-camera text-4xl text-gray-400"></i>
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                    <span>Ajouter des photos</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
                <p className="text-xs text-text-light dark:text-gray-500">PNG, JPG, GIF, WebP (max 5MB)</p>
              </div>
            </div>
             {images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-4">
                    {images.map((img, i) => (
                        <div 
                            key={i} 
                            className="relative group cursor-grab"
                            draggable
                            onDragStart={() => (dragItem.current = i)}
                            onDragEnter={() => (dragOverItem.current = i)}
                            onDragEnd={handleDragSort}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <img src={img} className="h-24 w-24 object-cover rounded-lg" alt="preview"/>
                            <button 
                                type="button" 
                                onClick={() => handleRemoveImage(i)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                aria-label="Supprimer l'image"
                            >&times;</button>
                        </div>
                    ))}
                </div>
             )}
          </div>
          
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text-main dark:text-secondary">Titre</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className={commonInputClasses} placeholder="ex: Robe d'été fleurie" required />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-main dark:text-secondary">Description</label>
            <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={commonInputClasses} placeholder="ex: Portée une seule fois, très bon état..."></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-text-main dark:text-secondary">Catégorie</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)} className={commonSelectClasses}>
                {Object.values(ProductCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-text-main dark:text-secondary">État</label>
              <select id="condition" value={condition} onChange={(e) => setCondition(e.target.value as ProductCondition)} className={commonSelectClasses}>
                {Object.values(ProductCondition).map(cond => <option key={cond} value={cond}>{cond}</option>)}
              </select>
            </div>
          </div>

          {availableSizes && (
            <div>
              <label className="block text-sm font-medium text-text-main dark:text-secondary">Taille</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {availableSizes.map(s => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSize(s === size ? '' : s)} // Allow deselecting
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                      size === s
                        ? 'bg-primary text-white border-primary'
                        : 'bg-transparent border-gray-300 dark:border-gray-600 hover:border-primary hover:text-primary dark:hover:text-primary'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-text-main dark:text-secondary">Prix de vente (MAD)</label>
              <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} className={commonInputClasses} placeholder="ex: 150" required />
            </div>
             <div>
              <label htmlFor="originalPrice" className="block text-sm font-medium text-text-main dark:text-secondary">Prix d'origine (Optionnel)</label>
              <input type="number" id="originalPrice" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className={commonInputClasses} placeholder="ex: 250" />
            </div>
          </div>

           <div>
              <label htmlFor="city" className="block text-sm font-medium text-text-main dark:text-secondary">Ville</label>
              <select id="city" value={city} onChange={(e) => setCity(e.target.value)} className={commonSelectClasses} required>
                <option value="">Sélectionnez une ville</option>
                {moroccanCities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button type="button" variant="ghost" onClick={onCancel} className="h-10 px-6">
              Annuler
            </Button>
            <Button type="submit" className="h-10 px-6">
              Ajouter l'article
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemPage;