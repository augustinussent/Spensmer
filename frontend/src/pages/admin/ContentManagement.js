import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Image, Type, Link as LinkIcon, Plus } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Textarea } from '../../components/ui/textarea';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const ContentManagement = () => {
  const [content, setContent] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const response = await axios.get(`${API_URL}/content`);
      const contentMap = {};
      response.data.forEach(item => {
        const key = `${item.page}_${item.section}`;
        contentMap[key] = item;
      });
      setContent(contentMap);
    } catch (error) {
      toast.error('Error fetching content');
    } finally {
      setIsLoading(false);
    }
  };

  const saveContent = async (page, section, contentType, contentData) => {
    setIsSaving(true);
    try {
      await axios.post(`${API_URL}/admin/content`, {
        page,
        section,
        content_type: contentType,
        content: contentData
      });
      toast.success('Content saved');
      fetchContent();
    } catch (error) {
      toast.error('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (key, field, value) => {
    setContent(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        content: {
          ...prev[key]?.content,
          [field]: value
        }
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div data-testid="content-management">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900">Kelola Konten</h1>
        <p className="text-gray-500">Ubah teks, foto, dan link di setiap halaman</p>
      </div>

      <Tabs defaultValue="home" className="space-y-6">
        <TabsList className="bg-white shadow-soft">
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="header">Header</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>

        {/* Home Content */}
        <TabsContent value="home" className="space-y-6">
          {/* Hero Section */}
          <div className="bg-white rounded-xl p-6 shadow-soft">
            <h3 className="font-display text-lg font-semibold text-gray-900 mb-4">Hero Section</h3>
            <div className="space-y-4">
              <div>
                <Label>Judul</Label>
                <Input
                  value={content['home_hero']?.content?.title || ''}
                  onChange={(e) => updateField('home_hero', 'title', e.target.value)}
                  placeholder="Spencer Green Hotel"
                  data-testid="hero-title-input"
                />
              </div>
              <div>
                <Label>Subtitle</Label>
                <Input
                  value={content['home_hero']?.content?.subtitle || ''}
                  onChange={(e) => updateField('home_hero', 'subtitle', e.target.value)}
                  placeholder="Experience Luxury in the Heart of Batu"
                  data-testid="hero-subtitle-input"
                />
              </div>
              <div>
                <Label>URL Gambar Hero</Label>
                <Input
                  value={content['home_hero']?.content?.image || ''}
                  onChange={(e) => updateField('home_hero', 'image', e.target.value)}
                  placeholder="https://..."
                  data-testid="hero-image-input"
                />
              </div>
              <Button
                onClick={() => saveContent('home', 'hero', 'hero', content['home_hero']?.content || {})}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                data-testid="save-hero-btn"
              >
                <Save className="w-4 h-4 mr-2" />
                Simpan Hero
              </Button>
            </div>
          </div>

          {/* Promo Banner */}
          <div className="bg-white rounded-xl p-6 shadow-soft">
            <h3 className="font-display text-lg font-semibold text-gray-900 mb-4">Promo Banner</h3>
            <div className="space-y-4">
              <div>
                <Label>Judul Promo</Label>
                <Input
                  value={content['home_promo_banner']?.content?.title || ''}
                  onChange={(e) => updateField('home_promo_banner', 'title', e.target.value)}
                  placeholder="Special Weekend Offer"
                  data-testid="promo-title-input"
                />
              </div>
              <div>
                <Label>Deskripsi</Label>
                <Textarea
                  value={content['home_promo_banner']?.content?.description || ''}
                  onChange={(e) => updateField('home_promo_banner', 'description', e.target.value)}
                  placeholder="Get 20% off for weekend stays..."
                  data-testid="promo-description-input"
                />
              </div>
              <div>
                <Label>URL Gambar</Label>
                <Input
                  value={content['home_promo_banner']?.content?.image || ''}
                  onChange={(e) => updateField('home_promo_banner', 'image', e.target.value)}
                  placeholder="https://..."
                  data-testid="promo-image-input"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="promo-active"
                  checked={content['home_promo_banner']?.content?.is_active || false}
                  onChange={(e) => updateField('home_promo_banner', 'is_active', e.target.checked)}
                  className="rounded border-gray-300"
                  data-testid="promo-active-checkbox"
                />
                <Label htmlFor="promo-active">Tampilkan Banner Promo</Label>
              </div>
              <Button
                onClick={() => saveContent('home', 'promo_banner', 'banner', content['home_promo_banner']?.content || {})}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                data-testid="save-promo-btn"
              >
                <Save className="w-4 h-4 mr-2" />
                Simpan Promo
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Header Content */}
        <TabsContent value="header" className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-soft">
            <h3 className="font-display text-lg font-semibold text-gray-900 mb-4">Header & Navigasi</h3>
            <p className="text-gray-500 mb-4">
              Navigasi header sudah dikonfigurasi dengan menu: Home, Kamar, Meeting, Wedding, Fasilitas, Gallery, Cek Reservasi
            </p>
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="text-emerald-800 text-sm">
                Menu navigasi saat ini tidak dapat diubah melalui CMS. Hubungi developer untuk perubahan menu.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Footer Content */}
        <TabsContent value="footer" className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-soft">
            <h3 className="font-display text-lg font-semibold text-gray-900 mb-4">Informasi Footer</h3>
            <div className="space-y-4">
              <div>
                <Label>Alamat</Label>
                <Textarea
                  value={content['global_footer']?.content?.address || ''}
                  onChange={(e) => updateField('global_footer', 'address', e.target.value)}
                  placeholder="Jl. Raya Selecta No. 1, Batu, East Java"
                  data-testid="footer-address-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Telepon</Label>
                  <Input
                    value={content['global_footer']?.content?.phone || ''}
                    onChange={(e) => updateField('global_footer', 'phone', e.target.value)}
                    placeholder="+62 813 3448 0210"
                    data-testid="footer-phone-input"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    value={content['global_footer']?.content?.email || ''}
                    onChange={(e) => updateField('global_footer', 'email', e.target.value)}
                    placeholder="info@spencergreen.com"
                    data-testid="footer-email-input"
                  />
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-3">Social Media Links</h4>
                <div className="space-y-3">
                  <div>
                    <Label>TikTok URL</Label>
                    <Input
                      value={content['global_footer']?.content?.tiktok || ''}
                      onChange={(e) => updateField('global_footer', 'tiktok', e.target.value)}
                      placeholder="https://tiktok.com/@spencergreenhotel"
                      data-testid="footer-tiktok-input"
                    />
                  </div>
                  <div>
                    <Label>Instagram URL</Label>
                    <Input
                      value={content['global_footer']?.content?.instagram || ''}
                      onChange={(e) => updateField('global_footer', 'instagram', e.target.value)}
                      placeholder="https://instagram.com/spencergreenhotel"
                      data-testid="footer-instagram-input"
                    />
                  </div>
                  <div>
                    <Label>Facebook URL</Label>
                    <Input
                      value={content['global_footer']?.content?.facebook || ''}
                      onChange={(e) => updateField('global_footer', 'facebook', e.target.value)}
                      placeholder="https://facebook.com/spencergreenhotel"
                      data-testid="footer-facebook-input"
                    />
                  </div>
                  <div>
                    <Label>WhatsApp Number</Label>
                    <Input
                      value={content['global_footer']?.content?.whatsapp || ''}
                      onChange={(e) => updateField('global_footer', 'whatsapp', e.target.value)}
                      placeholder="6281334480210"
                      data-testid="footer-whatsapp-input"
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={() => saveContent('global', 'footer', 'info', content['global_footer']?.content || {})}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                data-testid="save-footer-btn"
              >
                <Save className="w-4 h-4 mr-2" />
                Simpan Footer
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Gallery Content */}
        <TabsContent value="gallery" className="space-y-6">
          <div className="bg-white rounded-xl p-6 shadow-soft">
            <h3 className="font-display text-lg font-semibold text-gray-900 mb-4">Gallery Images</h3>
            <p className="text-gray-500 mb-4">
              Kelola gambar yang ditampilkan di halaman Gallery (TikTok-style scroll)
            </p>
            
            <div className="space-y-4">
              {[0, 1, 2, 3, 4, 5].map((index) => {
                const key = `gallery_gallery_item_${index}`;
                return (
                  <div key={index} className="flex gap-4 items-center">
                    <div className="flex-1">
                      <Label>Gambar {index + 1}</Label>
                      <Input
                        value={content[key]?.content?.url || ''}
                        onChange={(e) => updateField(key, 'url', e.target.value)}
                        placeholder="https://images.unsplash.com/..."
                        data-testid={`gallery-image-${index}-input`}
                      />
                    </div>
                    <div className="w-48">
                      <Label>Caption</Label>
                      <Input
                        value={content[key]?.content?.caption || ''}
                        onChange={(e) => updateField(key, 'caption', e.target.value)}
                        placeholder="Image caption"
                        data-testid={`gallery-caption-${index}-input`}
                      />
                    </div>
                    <Button
                      onClick={() => saveContent('gallery', `gallery_item_${index}`, 'image', {
                        ...content[key]?.content,
                        order: index
                      })}
                      disabled={isSaving}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white mt-6"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentManagement;
