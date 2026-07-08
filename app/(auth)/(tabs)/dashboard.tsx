import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Header from '@/components/ui/Header';
import KPICard from '@/components/dashboard/KPICard';
import MpsBar from '@/components/dashboard/MpsBar';
import Card from '@/components/ui/Card';
import { SkeletonDashboard } from '@/components/ui/SkeletonLoader';
import { useAuth } from '@/context/AuthContext';
import { useDrawer } from '@/context/DrawerContext';
import { useToast } from '@/context/ToastContext';
import { Colors } from '@/constants/Colors';
import { KPI_DATA, MPS_RECORDS, ANNOUNCEMENTS, SUBMISSIONS } from '@/data/mockData';

/* ─── Quick Access Card Data ─────────────────────────────────── */
interface QuickCard {
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  accent: string;
  roles: string[];
}

const QUICK_CARDS: QuickCard[] = [
  {
    label: 'Submit DLL',
    subtitle: 'Upload your lesson log',
    icon: 'document-attach-outline',
    route: '/(auth)/(tabs)/submissions',
    accent: Colors.maroon.primary,
    roles: ['teacher'],
  },
  {
    label: 'Lesson Plans',
    subtitle: 'Manage your lesson plans',
    icon: 'book-outline',
    route: '/(auth)/(tabs)/submissions',
    accent: '#1565C0',
    roles: ['teacher'],
  },
  {
    label: 'Enter MPS',
    subtitle: 'Submit performance scores',
    icon: 'calculator-outline',
    route: '/(auth)/(tabs)/mps',
    accent: '#2E7D32',
    roles: ['teacher'],
  },
  {
    label: 'My Messages',
    subtitle: 'Chat with the principal',
    icon: 'chatbubbles-outline',
    route: '/(auth)/(tabs)/chat',
    accent: '#6A1B9A',
    roles: ['teacher'],
  },
  {
    label: 'Monitor Submissions',
    subtitle: 'Track compliance by teacher',
    icon: 'clipboard-outline',
    route: '/(auth)/(tabs)/submissions',
    accent: Colors.maroon.primary,
    roles: ['principal', 'adas'],
  },
  {
    label: 'MPS Reports',
    subtitle: 'View performance analytics',
    icon: 'bar-chart-outline',
    route: '/(auth)/(tabs)/mps',
    accent: '#1565C0',
    roles: ['principal', 'adas'],
  },
  {
    label: 'Generate Reports',
    subtitle: 'Export PDF & Excel reports',
    icon: 'download-outline',
    route: '/(auth)/(tabs)/reports',
    accent: '#2E7D32',
    roles: ['principal', 'adas', 'secretary'],
  },
  {
    label: 'Post Announcement',
    subtitle: 'Notify all users',
    icon: 'megaphone-outline',
    route: '/(auth)/announcements',
    accent: '#F57F17',
    roles: ['principal', 'adas'],
  },
  {
    label: 'Chat with Staff',
    subtitle: 'Message teachers & staff',
    icon: 'people-outline',
    route: '/(auth)/(tabs)/chat',
    accent: '#6A1B9A',
    roles: ['principal'],
  },
  {
    label: 'View Announcements',
    subtitle: 'School notices & links',
    icon: 'notifications-outline',
    route: '/(auth)/announcements',
    accent: Colors.maroon.primary,
    roles: ['secretary'],
  },
  {
    label: 'Inbox',
    subtitle: 'Check your messages',
    icon: 'chatbubble-ellipses-outline',
    route: '/(auth)/(tabs)/chat',
    accent: '#6A1B9A',
    roles: ['secretary'],
  },
];

export default function DashboardScreen() {
  const { user } = useAuth();
  const { toggleDrawer } = useDrawer();
  const toast = useToast();
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const isAdmin = user?.role === 'principal' || user?.role === 'adas';
  const isTeacher = user?.role === 'teacher';

  useEffect(() => {
    const t = setTimeout(() => {
      setInitialLoading(false);
      toast.success('Dashboard loaded', 'Data is up to date.');
    }, 1400);
    return () => clearTimeout(t);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      toast.success('Refreshed', 'Dashboard data has been updated.');
    }, 1400);
  };

  const pendingCount = SUBMISSIONS.filter(s => s.status === 'pending' || s.status === 'missing').length;
  const flaggedCount = SUBMISSIONS.filter(s => s.plagiarismStatus === 'flagged').length;
  const myCards = QUICK_CARDS.filter(c => user?.role && c.roles.includes(user.role));

  const unreadMessages = 1;

  return (
    <View style={styles.flex}>
      <Header
        title="Dashboard"
        subtitle={`Welcome, ${user?.name?.split(' ').slice(-1)[0]}`}
        showMenu
        onMenuPress={toggleDrawer}
        rightIcon="chatbubbles-outline"
        onRightPress={() => router.push('/(auth)/(tabs)/chat')}
        badge={unreadMessages}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.maroon.primary} colors={[Colors.maroon.primary]} title="Refreshing dashboard..." />}
      >
        {initialLoading && <SkeletonDashboard />}
        {!initialLoading && <>

        {/* ─── User Banner ─────────────────────────── */}
        <View style={styles.userBanner}>
          <View style={styles.bannerLeft}>
            <View style={styles.bannerAvatar}>
              <Text style={styles.bannerAvatarText}>
                {user?.name?.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.bannerName}>{user?.name}</Text>
              <Text style={styles.bannerRole}>
                {user?.role === 'teacher'
                  ? `${user.subject} · ${user.gradeLevel}`
                  : user?.role?.toUpperCase()}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.profileBtn} onPress={() => router.push('/(auth)/profile')}>
            <Ionicons name="person-circle-outline" size={26} color={Colors.maroon.primary} />
          </TouchableOpacity>
        </View>

        {/* ─── Alert Banner ────────────────────────── */}
        {isAdmin && (pendingCount > 0 || flaggedCount > 0) && (
          <TouchableOpacity style={styles.alertBanner} onPress={() => router.push('/(auth)/(tabs)/submissions')} activeOpacity={0.8}>
            <Ionicons name="alert-circle" size={18} color={Colors.status.pending} />
            <Text style={styles.alertText}>
              {pendingCount} pending · {flaggedCount} flagged documents
            </Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.status.pending} />
          </TouchableOpacity>
        )}

        {/* ─── Quick Access Cards ───────────────────── */}
        <Text style={styles.sectionLabel}>Quick Access</Text>
        <View style={styles.quickGrid}>
          {myCards.map(card => (
            <TouchableOpacity
              key={card.label}
              style={styles.quickCard}
              onPress={() => router.push(card.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIconWrap, { backgroundColor: card.accent + '16' }]}>
                <Ionicons name={card.icon} size={26} color={card.accent} />
              </View>
              <Text style={styles.quickLabel}>{card.label}</Text>
              <Text style={styles.quickSub} numberOfLines={2}>{card.subtitle}</Text>
              <View style={[styles.quickArrow, { backgroundColor: card.accent }]}>
                <Ionicons name="chevron-forward" size={12} color={Colors.white} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── KPI Section (admin only) ─────────────── */}
        {isAdmin && (
          <>
            <Text style={styles.sectionLabel}>Key Performance Indicators</Text>
            <View style={styles.kpiRow}>
              <KPICard label="Teachers" value={KPI_DATA.totalTeachers} icon="people-outline" />
              <KPICard label="Learners" value={KPI_DATA.totalLearners} icon="school-outline" color="#1565C0" />
            </View>
            <View style={styles.kpiRow}>
              <KPICard label="Enrollment" value={KPI_DATA.enrollmentRate} unit="%" icon="trending-up-outline" color={Colors.status.submitted} trend="up" />
              <KPICard label="Survival Rate" value={KPI_DATA.survivalRate} unit="%" icon="shield-checkmark-outline" color={Colors.status.submitted} trend="up" />
            </View>
            <View style={styles.kpiRow}>
              <KPICard label="Overall MPS" value={KPI_DATA.overallMps} unit="%" icon="bar-chart-outline" />
              <KPICard label="Submission Rate" value={KPI_DATA.submissionCompliance} unit="%" icon="checkmark-circle-outline" color="#F57F17" />
            </View>
          </>
        )}

        {/* ─── MPS Overview ────────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>MPS Overview — Q1</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/(tabs)/mps')}>
            <Text style={styles.seeAllLink}>See all</Text>
          </TouchableOpacity>
        </View>
        <Card>
          {MPS_RECORDS.slice(0, 4).map(r => (
            <MpsBar key={r.id} subject={r.subject} gradeLevel={r.gradeLevel} mps={r.mps} />
          ))}
        </Card>

        {/* ─── Announcements ───────────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Announcements</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/announcements')}>
            <Text style={styles.seeAllLink}>View all</Text>
          </TouchableOpacity>
        </View>
        {ANNOUNCEMENTS.map(a => (
          <TouchableOpacity
            key={a.id}
            onPress={() => router.push('/(auth)/announcements')}
            activeOpacity={0.8}
          >
            <View style={[styles.announcementCard, a.priority === 'high' && styles.announcementCardUrgent]}>
              <View style={[styles.announcementDot, { backgroundColor: a.priority === 'high' ? Colors.status.missing : Colors.maroon.primary }]} />
              <View style={styles.announcementBody}>
                <View style={styles.announcementTop}>
                  {a.priority === 'high' && (
                    <View style={styles.urgentPill}>
                      <Text style={styles.urgentPillText}>Urgent</Text>
                    </View>
                  )}
                  <Text style={styles.announcementTitle}>{a.title}</Text>
                </View>
                <Text style={styles.announcementText} numberOfLines={2}>{a.body}</Text>
                <Text style={styles.announcementMeta}>{a.createdBy} · {a.createdAt}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.text.muted} />
            </View>
          </TouchableOpacity>
        ))}
        </>}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 36 },

  /* User Banner */
  userBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
  },
  bannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  bannerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.maroon.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerAvatarText: { color: Colors.white, fontSize: 16, fontWeight: '800' },
  bannerName: { fontSize: 15, fontWeight: '700', color: Colors.text.primary },
  bannerRole: { fontSize: 12, color: Colors.maroon.primary, fontWeight: '600', marginTop: 2 },
  profileBtn: { padding: 4 },

  /* Alert Banner */
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: Colors.status.pending,
  },
  alertText: { flex: 1, fontSize: 13, color: Colors.text.primary, fontWeight: '600' },

  /* Section Headers */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.text.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 10,
    marginTop: 6,
  },
  seeAllLink: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.maroon.primary,
    marginBottom: 10,
    marginTop: 6,
  },

  /* Quick Cards Grid */
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 6,
  },
  quickCard: {
    width: '47%',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    position: 'relative',
    minHeight: 130,
    justifyContent: 'flex-start',
  },
  quickIconWrap: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  quickSub: {
    fontSize: 11,
    color: Colors.text.secondary,
    lineHeight: 15,
    flex: 1,
  },
  quickArrow: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* KPI */
  kpiRow: { flexDirection: 'row', marginBottom: 0 },

  /* Announcements */
  announcementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    gap: 12,
  },
  announcementCardUrgent: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.status.missing,
  },
  announcementDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
    marginTop: 4,
  },
  announcementBody: { flex: 1 },
  announcementTop: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
  urgentPill: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  urgentPillText: { fontSize: 9, fontWeight: '800', color: Colors.status.missing, textTransform: 'uppercase', letterSpacing: 0.4 },
  announcementTitle: { fontSize: 14, fontWeight: '700', color: Colors.text.primary, flex: 1 },
  announcementText: { fontSize: 12, color: Colors.text.secondary, lineHeight: 17, marginBottom: 6 },
  announcementMeta: { fontSize: 10, color: Colors.text.muted },
});
