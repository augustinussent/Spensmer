import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Save, X, AlertCircle } from 'lucide-react';
import { format, addDays, startOfToday, addMonths, subMonths } from 'date-fns';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [viewMode, setViewMode] = useState('week');
  const [startDate, setStartDate] = useState(startOfToday());
  const [isLoading, setIsLoading] = useState(true);
  const [editingCell, setEditingCell] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkForm, setBulkForm] = useState({
    room_type_id: '',
    start_date: format(startOfToday(), 'yyyy-MM-dd'),
    end_date: format(addDays(startOfToday(), 7), 'yyyy-MM-dd'),
    allotment: '',
    rate: '',
    is_closed: 'no'
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  useEffect(() => {
    if (rooms.length > 0) {
      fetchInventory();
    }
  }, [rooms, startDate, viewMode]);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${API_URL}/rooms`);
      setRooms(response.data);
      if (response.data.length > 0 && !selectedRoom) {
        setSelectedRoom(response.data[0].room_type_id);
        setBulkForm(prev => ({ ...prev, room_type_id: response.data[0].room_type_id }));
      }
    } catch (error) {
      toast.error('Error fetching rooms');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInventory = async () => {
    const days = viewMode === 'week' ? 7 : 30;
    const endDate = addDays(startDate, days);
    
    try {
      const response = await axios.get(`${API_URL}/inventory`, {
        params: {
          start_date: format(startDate, 'yyyy-MM-dd'),
          end_date: format(endDate, 'yyyy-MM-dd')
        }
      });
      setInventory(response.data);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    }
  };

  const getDays = () => {
    const days = viewMode === 'week' ? 7 : 30;
    return Array.from({ length: days }, (_, i) => addDays(startDate, i));
  };

  const getInventoryForDate = (roomId, date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return inventory.find(inv => inv.room_type_id === roomId && inv.date === dateStr);
  };

  const handleCellUpdate = async (roomId, date, field, value) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const existing = getInventoryForDate(roomId, date);
    const room = rooms.find(r => r.room_type_id === roomId);
    
    const updateData = {
      room_type_id: roomId,
      date: dateStr,
      allotment: existing?.allotment ?? 5,
      rate: existing?.rate ?? room?.base_price ?? 500000,
      is_closed: existing?.is_closed ?? false,
      [field]: field === 'is_closed' ? value === 'true' : Number(value)
    };

    try {
      await axios.post(`${API_URL}/admin/inventory`, updateData);
      toast.success('Updated successfully');
      fetchInventory();
    } catch (error) {
      toast.error('Failed to update');
    }
    setEditingCell(null);
  };

  const handleBulkUpdate = async () => {
    if (!bulkForm.room_type_id) {
      toast.error('Please select a room type');
      return;
    }

    try {
      const payload = {
        room_type_id: bulkForm.room_type_id,
        start_date: bulkForm.start_date,
        end_date: bulkForm.end_date,
        allotment: bulkForm.allotment ? Number(bulkForm.allotment) : null,
        rate: bulkForm.rate ? Number(bulkForm.rate) : null,
        is_closed: bulkForm.is_closed === 'yes' ? true : bulkForm.is_closed === 'no' ? false : null
      };

      await axios.post(`${API_URL}/admin/inventory/bulk-update`, payload);
      toast.success('Bulk update successful');
      setShowBulkModal(false);
      fetchInventory();
    } catch (error) {
      toast.error('Bulk update failed');
    }
  };

  const navigateDates = (direction) => {
    const days = viewMode === 'week' ? 7 : 30;
    if (direction === 'prev') {
      setStartDate(addDays(startDate, -days));
    } else {
      setStartDate(addDays(startDate, days));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  return (
    <div data-testid="room-management">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900">Kelola Kamar</h1>
          <p className="text-gray-500">Atur allotment, harga & close out</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-32" data-testid="view-mode-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="month">Month View</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={() => setShowBulkModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            data-testid="bulk-update-btn"
          >
            Bulk Update
          </Button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-lg p-4 shadow-soft">
        <button
          onClick={() => navigateDates('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          data-testid="prev-dates-btn"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <span className="font-medium">
            {format(startDate, 'dd MMM yyyy')} - {format(addDays(startDate, viewMode === 'week' ? 6 : 29), 'dd MMM yyyy')}
          </span>
        </div>

        <button
          onClick={() => navigateDates('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          data-testid="next-dates-btn"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="sticky left-0 bg-gray-50 px-4 py-3 text-left font-medium text-gray-700 min-w-[150px]">
                  Tipe Kamar
                </th>
                <th className="px-2 py-3 text-left font-medium text-gray-700 min-w-[60px]">
                  Field
                </th>
                {getDays().map((day) => (
                  <th 
                    key={day.toISOString()} 
                    className="px-2 py-3 text-center font-medium text-gray-700 min-w-[80px]"
                  >
                    <div className="text-xs text-gray-400">{format(day, 'EEE')}</div>
                    <div>{format(day, 'dd')}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <>
                  {/* Allotment Row */}
                  <tr key={`${room.room_type_id}-allotment`} className="border-t">
                    <td className="sticky left-0 bg-white px-4 py-2 font-medium text-gray-900" rowSpan={3}>
                      {room.name}
                    </td>
                    <td className="px-2 py-2 text-sm text-gray-500">Allot</td>
                    {getDays().map((day) => {
                      const inv = getInventoryForDate(room.room_type_id, day);
                      const cellKey = `${room.room_type_id}-${format(day, 'yyyy-MM-dd')}-allotment`;
                      
                      return (
                        <td key={cellKey} className="px-1 py-1 text-center">
                          {editingCell === cellKey ? (
                            <Input
                              type="number"
                              defaultValue={inv?.allotment ?? 5}
                              className="w-16 h-8 text-center text-sm"
                              autoFocus
                              onBlur={(e) => handleCellUpdate(room.room_type_id, day, 'allotment', e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleCellUpdate(room.room_type_id, day, 'allotment', e.target.value);
                                } else if (e.key === 'Escape') {
                                  setEditingCell(null);
                                }
                              }}
                            />
                          ) : (
                            <button
                              onClick={() => setEditingCell(cellKey)}
                              className={`w-full py-1 text-sm rounded transition-colors ${
                                inv?.is_closed ? 'bg-red-100 text-red-600' : 'hover:bg-emerald-50'
                              }`}
                              data-testid={`allotment-${room.room_type_id}-${format(day, 'yyyy-MM-dd')}`}
                            >
                              {inv?.allotment ?? 5}
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Rate Row */}
                  <tr key={`${room.room_type_id}-rate`}>
                    <td className="px-2 py-2 text-sm text-gray-500">Rate</td>
                    {getDays().map((day) => {
                      const inv = getInventoryForDate(room.room_type_id, day);
                      const cellKey = `${room.room_type_id}-${format(day, 'yyyy-MM-dd')}-rate`;
                      const rate = inv?.rate ?? room.base_price;
                      
                      return (
                        <td key={cellKey} className="px-1 py-1 text-center">
                          {editingCell === cellKey ? (
                            <Input
                              type="number"
                              defaultValue={rate}
                              className="w-20 h-8 text-center text-xs"
                              autoFocus
                              onBlur={(e) => handleCellUpdate(room.room_type_id, day, 'rate', e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleCellUpdate(room.room_type_id, day, 'rate', e.target.value);
                                } else if (e.key === 'Escape') {
                                  setEditingCell(null);
                                }
                              }}
                            />
                          ) : (
                            <button
                              onClick={() => setEditingCell(cellKey)}
                              className={`w-full py-1 text-xs rounded transition-colors ${
                                inv?.is_closed ? 'bg-red-100 text-red-600' : 'hover:bg-emerald-50'
                              }`}
                              data-testid={`rate-${room.room_type_id}-${format(day, 'yyyy-MM-dd')}`}
                            >
                              {(rate / 1000).toFixed(0)}K
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* Close Out Row */}
                  <tr key={`${room.room_type_id}-closeout`} className="border-b">
                    <td className="px-2 py-2 text-sm text-gray-500">Close</td>
                    {getDays().map((day) => {
                      const inv = getInventoryForDate(room.room_type_id, day);
                      const cellKey = `${room.room_type_id}-${format(day, 'yyyy-MM-dd')}-close`;
                      
                      return (
                        <td key={cellKey} className="px-1 py-1 text-center">
                          <button
                            onClick={() => handleCellUpdate(room.room_type_id, day, 'is_closed', inv?.is_closed ? 'false' : 'true')}
                            className={`w-full py-1 text-xs rounded transition-colors ${
                              inv?.is_closed 
                                ? 'bg-red-500 text-white' 
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            }`}
                            data-testid={`closeout-${room.room_type_id}-${format(day, 'yyyy-MM-dd')}`}
                          >
                            {inv?.is_closed ? <X className="w-4 h-4 mx-auto" /> : '-'}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Update Modal */}
      <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Bulk Update</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Tipe Kamar</Label>
              <Select 
                value={bulkForm.room_type_id} 
                onValueChange={(v) => setBulkForm({ ...bulkForm, room_type_id: v })}
              >
                <SelectTrigger data-testid="bulk-room-select">
                  <SelectValue placeholder="Pilih tipe kamar" />
                </SelectTrigger>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.room_type_id} value={room.room_type_id}>
                      {room.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tanggal Mulai</Label>
                <Input
                  type="date"
                  value={bulkForm.start_date}
                  onChange={(e) => setBulkForm({ ...bulkForm, start_date: e.target.value })}
                  data-testid="bulk-start-date"
                />
              </div>
              <div>
                <Label>Tanggal Akhir</Label>
                <Input
                  type="date"
                  value={bulkForm.end_date}
                  onChange={(e) => setBulkForm({ ...bulkForm, end_date: e.target.value })}
                  data-testid="bulk-end-date"
                />
              </div>
            </div>

            <div>
              <Label>Allotment (kosongkan jika tidak diubah)</Label>
              <Input
                type="number"
                value={bulkForm.allotment}
                onChange={(e) => setBulkForm({ ...bulkForm, allotment: e.target.value })}
                placeholder="e.g., 5"
                data-testid="bulk-allotment"
              />
            </div>

            <div>
              <Label>Rate (kosongkan jika tidak diubah)</Label>
              <Input
                type="number"
                value={bulkForm.rate}
                onChange={(e) => setBulkForm({ ...bulkForm, rate: e.target.value })}
                placeholder="e.g., 850000"
                data-testid="bulk-rate"
              />
            </div>

            <div>
              <Label>Close Out</Label>
              <Select 
                value={bulkForm.is_closed} 
                onValueChange={(v) => setBulkForm({ ...bulkForm, is_closed: v })}
              >
                <SelectTrigger data-testid="bulk-closeout-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">Tidak diubah</SelectItem>
                  <SelectItem value="yes">Close (Tutup)</SelectItem>
                  <SelectItem value="no">Open (Buka)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleBulkUpdate}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              data-testid="bulk-submit-btn"
            >
              <Save className="w-4 h-4 mr-2" />
              Simpan Perubahan
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomManagement;
