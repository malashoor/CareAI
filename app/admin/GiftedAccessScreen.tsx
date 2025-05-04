import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Platform,
  I18nManager,
} from 'react-native';
import { useTheme } from '@rneui/themed';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAdminGifting } from '@/hooks/useAdminGifting';
import { GiftedUser, GiftedUserFilters, GiftedUserFormData } from '@/types/giftedUser';
import { AdminAccess } from '@/components/AdminAccess';
import { AccessibleContainer } from '@/components/AccessibleContainer';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { t } from '@/i18n';
import { useVoiceFeedback } from '@/hooks/useVoiceFeedback';

const STATUS_COLORS = {
  pending: '#FFA726',
  invited: '#42A5F5',
  accepted: '#66BB6A',
  expired: '#EF5350',
};

export default function GiftedAccessScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { speak } = useVoiceFeedback();
  const {
    loading,
    error,
    giftedUsers,
    fetchGiftedUsers,
    addGiftedUser,
    updateGiftedUser,
    sendInvite,
  } = useAdminGifting();

  const [filters, setFilters] = useState<GiftedUserFilters>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<GiftedUser | null>(null);
  const [formData, setFormData] = useState<GiftedUserFormData>({
    full_name: '',
    email: '',
    phone: '',
    region: '',
    charity_name: '',
    note: '',
  });

  useEffect(() => {
    fetchGiftedUsers(filters);
  }, [filters]);

  const handleAddUser = async () => {
    try {
      await addGiftedUser(formData);
      setShowAddModal(false);
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        region: '',
        charity_name: '',
        note: '',
      });
    } catch (err) {
      console.error('Error adding user:', err);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    try {
      await updateGiftedUser(selectedUser.id, formData);
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error updating user:', err);
    }
  };

  const handleSendInvite = async (userId: string) => {
    try {
      await sendInvite(userId);
    } catch (err) {
      console.error('Error sending invite:', err);
    }
  };

  const renderUserItem = ({ item }: { item: GiftedUser }) => (
    <Card style={styles.userCard}>
      <View style={styles.userHeader}>
        <View>
          <Text style={[styles.userName, { color: theme.colors.text }]}>
            {item.full_name}
          </Text>
          <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
            {item.email}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => {
              setSelectedUser(item);
              setFormData({
                full_name: item.full_name,
                email: item.email,
                phone: item.phone || '',
                region: item.region,
                charity_name: item.charity_name || '',
                note: item.note || '',
              });
              setShowEditModal(true);
            }}
            accessibilityLabel={t('admin.giftedUsers.edit')}
            accessibilityRole="button"
          >
            <MaterialIcons name="edit" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          {item.status === 'pending' && (
            <TouchableOpacity
              onPress={() => handleSendInvite(item.id)}
              accessibilityLabel={t('admin.giftedUsers.sendInvite')}
              accessibilityRole="button"
            >
              <MaterialIcons name="send" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.userDetails}>
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
            {t('admin.giftedUsers.region')}:
          </Text>
          <Text style={[styles.detailValue, { color: theme.colors.text }]}>
            {item.region}
          </Text>
        </View>
        {item.charity_name && (
          <View style={styles.detailRow}>
            <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
              {t('admin.giftedUsers.charity')}:
            </Text>
            <Text style={[styles.detailValue, { color: theme.colors.text }]}>
              {item.charity_name}
            </Text>
          </View>
        )}
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.textSecondary }]}>
            {t('admin.giftedUsers.status')}:
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: STATUS_COLORS[item.status] },
            ]}
          >
            <Text style={styles.statusText}>
              {t(`admin.giftedUsers.statuses.${item.status}`)}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );

  const renderFormModal = (
    visible: boolean,
    onClose: () => void,
    onSubmit: () => void,
    title: string
  ) => (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
            {title}
          </Text>
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder={t('admin.giftedUsers.fullName')}
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.full_name}
            onChangeText={(text) => setFormData({ ...formData, full_name: text })}
          />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder={t('admin.giftedUsers.email')}
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder={t('admin.giftedUsers.phone')}
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
            keyboardType="phone-pad"
          />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder={t('admin.giftedUsers.region')}
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.region}
            onChangeText={(text) => setFormData({ ...formData, region: text })}
          />
          <TextInput
            style={[styles.input, { color: theme.colors.text }]}
            placeholder={t('admin.giftedUsers.charity')}
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.charity_name}
            onChangeText={(text) => setFormData({ ...formData, charity_name: text })}
          />
          <TextInput
            style={[styles.input, styles.textArea, { color: theme.colors.text }]}
            placeholder={t('admin.giftedUsers.note')}
            placeholderTextColor={theme.colors.textSecondary}
            value={formData.note}
            onChangeText={(text) => setFormData({ ...formData, note: text })}
            multiline
            numberOfLines={4}
          />
          <View style={styles.modalActions}>
            <Button
              title={t('common.cancel')}
              onPress={onClose}
              variant="secondary"
              style={styles.modalButton}
            />
            <Button
              title={t('common.save')}
              onPress={onSubmit}
              style={styles.modalButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <AdminAccess>
      <AccessibleContainer
        style={[styles.container, { paddingTop: insets.top }]}
        accessibilityLabel={t('admin.giftedUsers.title')}
        accessibilityRole="screen"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {t('admin.giftedUsers.title')}
          </Text>
          <Button
            title={t('admin.giftedUsers.add')}
            onPress={() => setShowAddModal(true)}
            icon="add"
          />
        </View>

        <View style={styles.filters}>
          <TextInput
            style={[styles.filterInput, { color: theme.colors.text }]}
            placeholder={t('admin.giftedUsers.search')}
            placeholderTextColor={theme.colors.textSecondary}
            value={filters.search}
            onChangeText={(text) => setFilters({ ...filters, search: text })}
          />
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              // TODO: Implement filter modal
              speak(t('admin.giftedUsers.filters'));
            }}
          >
            <MaterialIcons name="filter-list" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={theme.colors.primary} />
        ) : error ? (
          <Text style={[styles.error, { color: theme.colors.error }]}>
            {error}
          </Text>
        ) : (
          <FlatList
            data={giftedUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}

        {renderFormModal(
          showAddModal,
          () => setShowAddModal(false),
          handleAddUser,
          t('admin.giftedUsers.add')
        )}

        {renderFormModal(
          showEditModal,
          () => setShowEditModal(false),
          handleEditUser,
          t('admin.giftedUsers.edit')
        )}
      </AccessibleContainer>
    </AdminAccess>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filters: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  userCard: {
    marginBottom: 16,
    padding: 16,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  userDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  modalButton: {
    minWidth: 100,
  },
  error: {
    textAlign: 'center',
    margin: 16,
  },
}); 