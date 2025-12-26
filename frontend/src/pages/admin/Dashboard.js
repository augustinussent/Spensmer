import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BedDouble, CalendarCheck, DollarSign, Star, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    occupied_rooms: 0,
    available_rooms: 0,
    monthly_revenue: 0,
    total_room_types: 0,
    pending_reviews: 0,
    recent_reservations: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/dashboard`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const mockChartData = [
    { name: 'Week 1', revenue: 15000000 },
    { name: 'Week 2', revenue: 22000000 },
    { name: 'Week 3', revenue: 18000000 },
    { name: 'Week 4', revenue: 28000000 },
  ];

  const statCards = [
    { 
      title: 'Kamar Terisi', 
      value: stats.occupied_rooms, 
      icon: BedDouble, 
      color: 'bg-emerald-500',
      description: 'Hari ini'
    },
    { 
      title: 'Kamar Tersedia', 
      value: stats.available_rooms, 
      icon: CalendarCheck, 
      color: 'bg-blue-500',
      description: 'Hari ini'
    },
    { 
      title: 'Pendapatan Bulan Ini', 
      value: `Rp ${(stats.monthly_revenue / 1000000).toFixed(1)}M`, 
      icon: DollarSign, 
      color: 'bg-amber-500',
      description: 'Simulasi'
    },
    { 
      title: 'Review Pending', 
      value: stats.pending_reviews, 
      icon: Star, 
      color: 'bg-purple-500',
      description: 'Menunggu approval'
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'checked_in': return 'bg-emerald-100 text-emerald-800';
      case 'checked_out': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div data-testid="admin-dashboard">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Ringkasan data hotel hari ini</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-soft"
              data-testid={`stat-card-${index}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-gray-500 text-sm mb-1">{stat.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-gray-400 text-xs mt-1">{stat.description}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl p-6 shadow-soft">
          <h2 className="font-display text-xl font-semibold text-gray-900 mb-6">Pendapatan Bulanan</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" tickFormatter={(value) => `${value / 1000000}M`} />
                <Tooltip 
                  formatter={(value) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#059669" 
                  fill="#d1fae5" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Reservations */}
        <div className="bg-white rounded-xl p-6 shadow-soft">
          <h2 className="font-display text-xl font-semibold text-gray-900 mb-6">Reservasi Terbaru</h2>
          <div className="space-y-4">
            {stats.recent_reservations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Belum ada reservasi</p>
            ) : (
              stats.recent_reservations.map((reservation) => (
                <div 
                  key={reservation.reservation_id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  data-testid={`recent-reservation-${reservation.reservation_id}`}
                >
                  <div>
                    <p className="font-medium text-gray-900">{reservation.guest_name}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(reservation.check_in), 'dd MMM')} - {format(new Date(reservation.check_out), 'dd MMM')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                      {reservation.status}
                    </span>
                    <p className="text-sm text-emerald-600 font-medium mt-1">
                      Rp {reservation.total_amount.toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
