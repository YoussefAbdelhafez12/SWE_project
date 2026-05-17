import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { COLORS, FONTS } from '../constants/theme';

// Auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Community Member screens
import CommunityHomeScreen from '../screens/community/HomeScreen';
import SubmitIssueScreen from '../screens/community/SubmitIssueScreen';
import MyIssuesScreen from '../screens/community/MyIssuesScreen';

// FM screens
import ManagerDashboardScreen from '../screens/manager/DashboardScreen';
import AssignWorkerScreen from '../screens/manager/AssignWorkerScreen';

// Worker screens
import WorkerDashboardScreen from '../screens/worker/DashboardScreen';
import WorkerHistoryScreen from '../screens/worker/HistoryScreen';

// Shared screens
import IssueDetailScreen from '../screens/shared/IssueDetailScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

// Admin screens
import PendingApprovalsScreen from '../screens/admin/PendingApprovalsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ============================================================
// AUTH STACK
// ============================================================
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// ============================================================
// COMMUNITY MEMBER TABS
// ============================================================
const CommunityTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        switch (route.name) {
          case 'Home': iconName = focused ? 'home' : 'home-outline'; break;
          case 'MyIssues': iconName = focused ? 'list' : 'list-outline'; break;
          case 'Profile': iconName = focused ? 'person' : 'person-outline'; break;
          default: iconName = 'ellipse';
        }
        return <Ionicons name={iconName} size={22} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textTertiary,
      tabBarStyle: {
        backgroundColor: COLORS.surface,
        borderTopWidth: 0,
        elevation: 12,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        height: 60,
        paddingBottom: 8,
        paddingTop: 6,
      },
      tabBarLabelStyle: {
        fontSize: 11,
        fontWeight: '600',
      },
    })}
  >
    <Tab.Screen name="Home" component={CommunityHomeScreen} />
    <Tab.Screen name="MyIssues" component={MyIssuesScreen} options={{ tabBarLabel: 'My Issues' }} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// ============================================================
// FACILITY MANAGER TABS
// ============================================================
const ManagerTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color }) => {
        let iconName;
        switch (route.name) {
          case 'Dashboard': iconName = focused ? 'grid' : 'grid-outline'; break;
          case 'Profile': iconName = focused ? 'person' : 'person-outline'; break;
          default: iconName = 'ellipse';
        }
        return <Ionicons name={iconName} size={22} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textTertiary,
      tabBarStyle: {
        backgroundColor: COLORS.surface,
        borderTopWidth: 0,
        elevation: 12,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        height: 60,
        paddingBottom: 8,
        paddingTop: 6,
      },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    })}
  >
    <Tab.Screen name="Dashboard" component={ManagerDashboardScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// ============================================================
// WORKER TABS
// ============================================================
const WorkerTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color }) => {
        let iconName;
        switch (route.name) {
          case 'Tasks': iconName = focused ? 'construct' : 'construct-outline'; break;
          case 'Profile': iconName = focused ? 'person' : 'person-outline'; break;
          default: iconName = 'ellipse';
        }
        return <Ionicons name={iconName} size={22} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textTertiary,
      tabBarStyle: {
        backgroundColor: COLORS.surface,
        borderTopWidth: 0,
        elevation: 12,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        height: 60,
        paddingBottom: 8,
        paddingTop: 6,
      },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    })}
  >
    <Tab.Screen name="Tasks" component={WorkerDashboardScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// ============================================================
// ADMIN TABS (uses Manager Dashboard + Pending Approvals)
// ============================================================
const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color }) => {
        let iconName;
        switch (route.name) {
          case 'Dashboard': iconName = focused ? 'grid' : 'grid-outline'; break;
          case 'Approvals': iconName = focused ? 'person-add' : 'person-add-outline'; break;
          case 'Profile': iconName = focused ? 'person' : 'person-outline'; break;
          default: iconName = 'ellipse';
        }
        return <Ionicons name={iconName} size={22} color={color} />;
      },
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textTertiary,
      tabBarStyle: {
        backgroundColor: COLORS.surface,
        borderTopWidth: 0,
        elevation: 12,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 12,
        height: 60,
        paddingBottom: 8,
        paddingTop: 6,
      },
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    })}
  >
    <Tab.Screen name="Dashboard" component={ManagerDashboardScreen} />
    <Tab.Screen
      name="Approvals"
      component={PendingApprovalsScreen}
      options={{ tabBarLabel: 'Approvals' }}
    />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

// ============================================================
// ROLE-BASED HOME SELECTOR
// ============================================================
const getRoleTabs = (role) => {
  switch (role) {
    case 'facility_manager': return ManagerTabs;
    case 'worker': return WorkerTabs;
    case 'admin': return AdminTabs;
    default: return CommunityTabs;
  }
};

// ============================================================
// MAIN APP NAVIGATOR
// ============================================================
const AppNavigator = () => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const HomeTabs = getRoleTabs(user?.role);

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthStack />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="HomeTabs" component={HomeTabs} />
          <Stack.Screen name="SubmitIssue" component={SubmitIssueScreen} />
          <Stack.Screen name="IssueDetail" component={IssueDetailScreen} />
          <Stack.Screen name="AssignWorker" component={AssignWorkerScreen} />
          <Stack.Screen name="WorkerHistory" component={WorkerHistoryScreen} />
          <Stack.Screen name="Notifications" component={NotificationsScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
