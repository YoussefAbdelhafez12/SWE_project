import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/Input';
import Button from '../../components/Button';
import api from '../../config/api';
import { COLORS, RADIUS, FONTS, SPACING, SHADOWS } from '../../constants/theme';

const SubmitIssueScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(null);
  const [locationType, setLocationType] = useState('indoor');
  const [building, setBuilding] = useState('');
  const [roomFloor, setRoomFloor] = useState('');
  const [locationDesc, setLocationDesc] = useState('');
  const [photo, setPhoto] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/issues/categories');
      setCategories(res.data.data.categories || []);
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  };

  const pickImage = async (fromCamera = false) => {
    try {
      const permission = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== 'granted') {
        Alert.alert('Permission Required', `Please grant ${fromCamera ? 'camera' : 'gallery'} access.`);
        return;
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, allowsEditing: true });

      if (!result.canceled && result.assets[0]) {
        setPhoto(result.assets[0]);
      }
    } catch (error) {
      console.error('Image picker error:', error);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!categoryId) newErrors.category = 'Please select a category';
    if (!photo) newErrors.photo = 'Please add a photo of the issue';
    if (locationType === 'indoor' && !building.trim()) newErrors.building = 'Building name is required';
    if (locationType === 'outdoor' && !locationDesc.trim()) newErrors.locationDesc = 'Location description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category_id', categoryId);
      formData.append('location_type', locationType);
      if (locationType === 'indoor') {
        formData.append('building', building.trim());
        formData.append('room_floor', roomFloor.trim());
      } else {
        formData.append('location_description', locationDesc.trim());
      }

      if (photo) {
        const uri = photo.uri;
        const name = uri.split('/').pop();
        const type = 'image/jpeg';
        formData.append('photo', { uri, name, type });
      }

      const res = await api.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const trackingId = res.data.data.issue.tracking_id;
      Alert.alert(
        '✅ Issue Submitted!',
        `Your issue has been submitted successfully.\n\nTracking ID: ${trackingId}`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit issue.';
      Alert.alert('Submission Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const CATEGORY_ICONS = {
    'Electrical': 'flash-outline',
    'Plumbing': 'water-outline',
    'Cleaning': 'sparkles-outline',
    'Furniture': 'bed-outline',
    'HVAC': 'thermometer-outline',
    'Safety': 'shield-checkmark-outline',
    'IT & Network': 'wifi-outline',
    'Other': 'ellipsis-horizontal-outline',
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>Report Issue</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Photo Section */}
          <Text style={styles.sectionLabel}>Photo of Issue *</Text>
          {photo ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: photo.uri }} style={styles.photoImage} />
              <TouchableOpacity style={styles.removePhoto} onPress={() => setPhoto(null)}>
                <Ionicons name="close-circle" size={28} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoRow}>
              <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(true)}>
                <Ionicons name="camera-outline" size={28} color={COLORS.primary} />
                <Text style={styles.photoBtnText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.photoBtn} onPress={() => pickImage(false)}>
                <Ionicons name="images-outline" size={28} color={COLORS.primary} />
                <Text style={styles.photoBtnText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          )}
          {errors.photo && <Text style={styles.errorText}>{errors.photo}</Text>}

          {/* Title */}
          <Input
            label="Issue Title *"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Broken door handle in B3"
            icon="create-outline"
            error={errors.title}
          />

          {/* Description */}
          <Input
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the issue in detail..."
            multiline
            numberOfLines={4}
            maxLength={500}
            icon="document-text-outline"
          />

          {/* Category */}
          <Text style={styles.sectionLabel}>Category *</Text>
          <View style={styles.categoryGrid}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, categoryId === cat.id && styles.categoryChipActive]}
                onPress={() => setCategoryId(cat.id)}
              >
                <Ionicons
                  name={CATEGORY_ICONS[cat.name] || 'ellipsis-horizontal-outline'}
                  size={16}
                  color={categoryId === cat.id ? '#FFF' : COLORS.primary}
                />
                <Text style={[styles.categoryChipText, categoryId === cat.id && { color: '#FFF' }]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

          {/* Location Type */}
          <Text style={styles.sectionLabel}>Location *</Text>
          <View style={styles.toggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, locationType === 'indoor' && styles.toggleBtnActive]}
              onPress={() => setLocationType('indoor')}
            >
              <Ionicons name="business-outline" size={18} color={locationType === 'indoor' ? '#FFF' : COLORS.textSecondary} />
              <Text style={[styles.toggleText, locationType === 'indoor' && { color: '#FFF' }]}>Indoor</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, locationType === 'outdoor' && styles.toggleBtnActive]}
              onPress={() => setLocationType('outdoor')}
            >
              <Ionicons name="leaf-outline" size={18} color={locationType === 'outdoor' ? '#FFF' : COLORS.textSecondary} />
              <Text style={[styles.toggleText, locationType === 'outdoor' && { color: '#FFF' }]}>Outdoor</Text>
            </TouchableOpacity>
          </View>

          {locationType === 'indoor' ? (
            <>
              <Input label="Building" value={building} onChangeText={setBuilding} placeholder="e.g., Building B3" icon="business-outline" error={errors.building} />
              <Input label="Room / Floor" value={roomFloor} onChangeText={setRoomFloor} placeholder="e.g., Floor 2, Room 201" icon="layers-outline" />
            </>
          ) : (
            <Input label="Location Description" value={locationDesc} onChangeText={setLocationDesc} placeholder="e.g., Near the main gate parking area" icon="navigate-outline" multiline numberOfLines={2} error={errors.locationDesc} />
          )}

          <Button title="Submit Issue" onPress={handleSubmit} loading={loading} icon="send-outline" style={{ marginTop: SPACING.xl, marginBottom: SPACING.section }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 56, paddingBottom: SPACING.lg, paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: FONTS.sizes.lg, fontWeight: '700', color: COLORS.text },
  scroll: { paddingHorizontal: SPACING.xxl, paddingTop: SPACING.xl },
  sectionLabel: { fontSize: FONTS.sizes.sm, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm, marginTop: SPACING.md },
  photoRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  photoBtn: {
    flex: 1, height: 120, backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.xl,
    borderWidth: 2, borderColor: COLORS.primary, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },
  photoBtnText: { fontSize: FONTS.sizes.sm, color: COLORS.primary, fontWeight: '600', marginTop: SPACING.xs },
  photoPreview: { position: 'relative', marginBottom: SPACING.lg },
  photoImage: { width: '100%', height: 200, borderRadius: RADIUS.xl },
  removePhoto: { position: 'absolute', top: 8, right: 8 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  categoryChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primarySoft, borderRadius: RADIUS.full,
    borderWidth: 1, borderColor: COLORS.primary,
  },
  categoryChipActive: { backgroundColor: COLORS.primary },
  categoryChipText: { fontSize: FONTS.sizes.sm, fontWeight: '600', color: COLORS.primary, marginLeft: 6 },
  toggleRow: { flexDirection: 'row', gap: SPACING.md, marginBottom: SPACING.lg },
  toggleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: SPACING.md, backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border, gap: 8,
  },
  toggleBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  toggleText: { fontSize: FONTS.sizes.md, fontWeight: '600', color: COLORS.textSecondary },
  errorText: { fontSize: FONTS.sizes.xs, color: COLORS.error, marginTop: -SPACING.sm, marginBottom: SPACING.sm, marginLeft: 4 },
});

export default SubmitIssueScreen;
