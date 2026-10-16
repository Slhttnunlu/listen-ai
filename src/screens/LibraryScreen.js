import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { styles } from '../styles';
import { filterLibraryItems, getLibraryItemMeta, LIBRARY_FILTERS } from '../utils/library';

export function LibraryScreen({ items, ready, onAdd, onOpen }) {
  const [filter, setFilter] = useState('Tümü');
  const filteredItems = useMemo(() => filterLibraryItems(items, filter), [filter, items]);

  return (
    <View style={styles.white}>
      <View style={styles.libHead}>
        <Text style={styles.libTitle}>Kütüphanem</Text>
        <View style={styles.pro}>
          <Text style={styles.proText}>PRO</Text>
        </View>
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
        ) : filteredItems.length === 0 ? (
          <Text style={styles.empty}>
            {items.length
              ? 'Bu filtrede gösterilecek metin yok.'
              : 'Henüz kayıtlı metin yok. İlk metninizi eklemek için + düğmesine dokunun.'}
          </Text>
        ) : (
          filteredItems.map((item) => (
            <Pressable
              accessibilityRole="button"
              key={item.id}
              onPress={() => onOpen(item)}
              style={styles.libraryCard}
            >
              <View style={styles.preview}>
                <Text style={styles.previewText}>☰</Text>
              </View>
              <View style={styles.copy}>
                <Text numberOfLines={1} style={styles.itemTitle}>
                  {item.title}
                </Text>
                <Text style={styles.meta}>{getLibraryItemMeta(item)}</Text>
              </View>
              <Text style={styles.more}>›</Text>
            </Pressable>
          ))
        )}
      </ScrollView>
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
