// Carousel from the original CalcuVerbs app (swipe or tap an item to select).
// Built on a snapping horizontal ScrollView so it works on iOS, Android and web.
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Dimensions, Platform, Pressable, StyleSheet, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  Extrapolation, interpolate, useAnimatedRef, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { radius, useTheme } from "@/src/theme";

const GAP = 12;

type Props<T> = {
  data: T[];
  index: number;
  onChange: (i: number) => void;
  itemWidth: number;
  itemHeight: number;
  accent: string;
  renderItem: (item: T, isActive: boolean) => ReactNode;
  testID?: string;
  itemTestID?: (item: T, i: number) => string;
};

function Item({
  scrollX, stride, position, width, height, children, onPress, testID,
}: {
  scrollX: SharedValue<number>; stride: number; position: number; width: number; height: number;
  children: ReactNode; onPress: () => void; testID?: string;
}) {
  const style = useAnimatedStyle(() => {
    const d = Math.abs(scrollX.value / stride - position);
    return {
      transform: [{ scale: interpolate(d, [0, 1, 2], [1, 0.84, 0.78], Extrapolation.CLAMP) }],
      opacity: interpolate(d, [0, 1, 2], [1, 0.55, 0.32], Extrapolation.CLAMP),
    };
  });
  return (
    <Animated.View style={[{ width, height, marginRight: GAP }, style]}>
      <Pressable testID={testID} onPress={onPress} style={styles.fill}>{children}</Pressable>
    </Animated.View>
  );
}

export default function DragCarousel<T>({
  data, index, onChange, itemWidth, itemHeight, accent, renderItem, testID, itemTestID,
}: Props<T>) {
  const { colors } = useTheme();
  const stride = itemWidth + GAP;
  const [width, setWidth] = useState(Dimensions.get("window").width - 32);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollX = useSharedValue(index * stride);
  const indexRef = useRef(index);
  const webTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToIndex = useCallback((i: number, animated = true) => {
    scrollRef.current?.scrollTo({ x: i * stride, animated });
  }, [scrollRef, stride]);

  // Keep scroll position in sync if index changes from outside.
  useEffect(() => {
    if (Math.round(scrollX.value / stride) !== index) scrollToIndex(index);
    indexRef.current = index;
  }, [index, stride, scrollToIndex, scrollX]);

  const settle = useCallback((x: number, snap: boolean) => {
    let i = Math.round(x / stride);
    if (i < 0) i = 0;
    if (i > data.length - 1) i = data.length - 1;
    if (snap && Math.abs(x - i * stride) > 1) scrollToIndex(i);
    if (i !== indexRef.current) {
      indexRef.current = i;
      onChange(i);
    }
  }, [stride, data.length, onChange, scrollToIndex]);

  // Web has no momentum events: settle shortly after scrolling stops.
  const settleWeb = useCallback((x: number) => {
    if (webTimer.current) clearTimeout(webTimer.current);
    webTimer.current = setTimeout(() => settle(x, true), 120);
  }, [settle]);

  const isWeb = Platform.OS === "web";
  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
      if (isWeb) scheduleOnRN(settleWeb, e.contentOffset.x);
    },
    onMomentumEnd: (e) => {
      scheduleOnRN(settle, e.contentOffset.x, false);
    },
    onEndDrag: (e) => {
      scheduleOnRN(settle, e.contentOffset.x, false);
    },
  });

  // Web (mouse): click-and-drag to scroll, like a finger swipe.
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null);
  const dragged = useRef(false);
  const webPointer = isWeb ? {
    onPointerDown: (e: any) => {
      if (e.nativeEvent.pointerType !== "mouse") return;
      drag.current = { x: e.nativeEvent.clientX, start: scrollX.value, moved: false };
      dragged.current = false;
    },
    onPointerMove: (e: any) => {
      const d = drag.current;
      if (!d) return;
      const dx = e.nativeEvent.clientX - d.x;
      if (Math.abs(dx) > 5) { d.moved = true; dragged.current = true; }
      if (d.moved) scrollRef.current?.scrollTo({ x: Math.max(d.start - dx, 0), animated: false });
    },
    onPointerUp: () => {
      if (drag.current?.moved) settle(scrollX.value, true);
      drag.current = null;
    },
    onPointerLeave: () => {
      if (drag.current?.moved) settle(scrollX.value, true);
      drag.current = null;
    },
  } : {};

  const onLayout = useCallback((e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width), []);
  const sidePad = Math.max((width - itemWidth) / 2, 0);

  return (
    <View style={[styles.container, { height: itemHeight + 16 }]} onLayout={onLayout} {...webPointer}>
      <View
        pointerEvents="none"
        style={[styles.frame, { left: sidePad, width: itemWidth, height: itemHeight, top: 8, borderColor: accent, backgroundColor: colors.frameFill }]}
      />
      <Animated.ScrollView
        ref={scrollRef}
        testID={testID}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={stride}
        decelerationRate="fast"
        disableIntervalMomentum
        scrollEventThrottle={16}
        onScroll={onScroll}
        contentOffset={{ x: index * stride, y: 0 }}
        contentContainerStyle={{ paddingLeft: sidePad, paddingRight: Math.max(sidePad - GAP, 0), paddingTop: 8, alignItems: "center" }}
      >
        {data.map((item, i) => (
          <Item
            key={i}
            scrollX={scrollX}
            stride={stride}
            position={i}
            width={itemWidth}
            height={itemHeight}
            onPress={() => {
              if (dragged.current) { dragged.current = false; return; }
              scrollToIndex(i);
              settle(i * stride, false);
            }}
            testID={itemTestID?.(item, i)}
          >
            {renderItem(item, i === index)}
          </Item>
        ))}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: "hidden", justifyContent: "center" },
  fill: { flex: 1 },
  frame: { position: "absolute", borderWidth: 2.5, borderRadius: radius.md },
});
