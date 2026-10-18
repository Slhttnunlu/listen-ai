import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { styles } from '../styles';
import { getLibraryItemMeta, LIBRARY_FILTERS, prepareLibraryItems } from '../utils/library';

export function LibraryScreen({
  items,
  ready,
  loadError,
  onRetry,
  onAdd,
  onOpen,
  onRename,
  onToggleFavorite,
  onDelete,
  onRestore,
}) {
  const [filter, setFilter] = useState('Tümü');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('Son Kullanılan');
  const [editingId, setEditingId] = useState(null);
  const [draftTitle, setDraftTitle] = useState('');
  const [managedId, setManagedId] = useState(null);
  const [deletedItem, setDeletedItem] = useState(null);
  const filteredItems = useMemo(
    () => prepareLibraryItems(items, { filter, query, sort }),
    [filter, items, query, sort]
  );

  const startRename = (item) => {
    setEditingId(item.id);
    setDraftTitle(item.title);
  };

  const saveRename = async () => {
    const saved = await onRename(editingId, draftTitle);
    if (saved) setEditingId(null);
  };

  const deleteWithUndo = async (item) => {
    await onDelete(item);
    setDeletedItem(item);
    setManagedId(null);
  };

  return (
    <View style={styles.white}>
      <View style={styles.libHead}>
        <Text accessibilityRole="header" style={styles.libTitle}>
          Kütüphanem
        </Text>
      </View>
      <View style={styles.libraryTools}>
        <TextInput
          accessibilityLabel="Kütüphanede ara"
          value={query}
          onChangeText={setQuery}
          placeholder="Metinlerde ara"
          placeholderTextColor="#999"
          style={styles.searchInput}
        />
        <Pressable
          accessibilityLabel={`Sıralama: ${sort}`}
          accessibilityHint="Başlığa veya son kullanıma göre sıralamayı değiştirir"
          accessibilityRole="button"
          onPress={() =>
            setSort((current) => (current === 'Son Kullanılan' ? 'Başlık' : 'Son Kullanılan'))
          }
          style={styles.sortButton}
        >
          <Text style={styles.sortButtonText}>{sort === 'Son Kullanılan' ? 'Son ↕' : 'A-Z'}</Text>
        </Pressable>
      </View>
      <ScrollView
        horizontal
        contentContainerStyle={styles.filters}
        showsHorizontalScrollIndicator={false}
      >
        {LIBRARY_FILTERS.map((name) => (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: filter === name }}
            onPress={() => setFilter(name)}
            key={name}
            style={[styles.filter, filter === name && styles.filterOn]}
          >
            <Text style={[styles.filterText, filter === name && styles.filterTextOn]}>{name}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView contentContainerStyle={styles.list}>
        {!ready ? (
          <Text style={styles.empty}>Kütüphaneniz yükleniyor…</Text>
        ) : loadError ? (
          <View style={styles.errorState}>
            <Text style={styles.errorTitle}>Kütüphane yüklenemedi</Text>
            <Text style={styles.empty}>Kayıtlarınıza şu anda ulaşılamıyor.</Text>
            <Pressable
              accessibilityRole="button"
              testID="library-retry-button"
              onPress={onRetry}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Tekrar dene</Text>
            </Pressable>
          </View>
        ) : filteredItems.length === 0 ? (
          <Text style={styles.empty}>
            {items.length
              ? 'Aramanızla eşleşen bir metin yok.'
              : 'Henüz kayıtlı metin yok. İlk metninizi eklemek için + düğmesine dokunun.'}
          </Text>
        ) : (
          filteredItems.map((item) => (
            <View key={item.id} style={styles.libraryCard}>
              <Pressable
                accessibilityLabel={`${item.title} metnini aç`}
                accessibilityRole="button"
                onPress={() => onOpen(item)}
                style={styles.libraryCardMain}
              >
                <View style={styles.preview}>
                  <Text style={styles.previewText}>{item.is_favorite ? '♥' : '☰'}</Text>
                </View>
                <View style={styles.copy}>
                  {editingId === item.id ? (
                    <View style={styles.renameRow}>
                      <TextInput
                        accessibilityLabel="Yeni başlık"
                        autoFocus
                        value={draftTitle}
                        onChangeText={setDraftTitle}
                        style={styles.renameInput}
                      />
                      <Pressable
                        accessibilityRole="button"
                        onPress={saveRename}
                        style={styles.renameSaveButton}
                      >
                        <Text style={styles.renameSave}>Kaydet</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Text numberOfLines={1} style={styles.itemTitle}>
                      {item.title}
                    </Text>
                  )}
                  <Text style={styles.meta}>{getLibraryItemMeta(item)}</Text>
                </View>
              </Pressable>
              <Pressable
                accessibilityLabel="Metin işlemleri"
                accessibilityRole="button"
                onPress={() => setManagedId((current) => (current === item.id ? null : item.id))}
                style={styles.moreButton}
              >
                <Text style={styles.more}>•••</Text>
              </Pressable>
              {managedId === item.id && (
                <View style={styles.itemActions}>
                  <Pressable
                    accessibilityLabel={item.is_favorite ? 'Favoriden çıkar' : 'Favorile'}
                    accessibilityRole="button"
                    onPress={() => onToggleFavorite(item)}
                    style={styles.itemActionButton}
                  >
                    <Text style={styles.itemAction}>
                      {item.is_favorite ? 'Favoriden çıkar' : 'Favorile'}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => startRename(item)}
                    style={styles.itemActionButton}
                  >
                    <Text style={styles.itemAction}>Yeniden adlandır</Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => deleteWithUndo(item)}
                    style={styles.itemActionButton}
                  >
                    <Text style={styles.deleteAction}>Sil</Text>
                  </Pressable>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
      {deletedItem && (
        <View style={styles.undoBar}>
          <Text numberOfLines={1} style={styles.undoText}>
            “{deletedItem.title}” silindi.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={async () => {
              await onRestore(deletedItem);
              setDeletedItem(null);
            }}
            style={styles.undoButton}
          >
            <Text style={styles.undoAction}>Geri al</Text>
          </Pressable>
        </View>
      )}
      <Pressable
        accessibilityLabel="Yeni metin ekle"
        accessibilityRole="button"
        onPress={onAdd}
        style={styles.fab}
      >
        <Text style={styles.fabText}>＋</Text>
      </Pressable>
    </View>
  );
}
