import { useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { isRelayManagedConnection } from "../../lib/connection";
import { cn } from "../../lib/cn";
import { useSavedRemoteConnections } from "../../state/use-remote-environment-registry";
import { AppText as Text } from "../../components/ui/AppText";
import { SymbolView, type AppSymbolName } from "../../components/ui/AppSymbol";
import { T3Wordmark } from "../../components/T3Wordmark";
import type { EnvironmentId } from "@t3tools/contracts";
import { useHomeListOptions } from "./home-list-options";

/**
 * Home header: a tappable T3 mark that opens Settings, followed by the
 * environments as a horizontally scrolling row of pills. "All" is the
 * unfiltered default; tapping an environment narrows the thread list.
 */
export function T3EnvironmentHeader(props: {
  readonly maxWidth?: number;
  readonly onOpenSettings: () => void;
}) {
  const { savedConnectionsById } = useSavedRemoteConnections();
  const environments = useMemo(
    () =>
      Object.values(savedConnectionsById)
        .map((connection) => ({
          environmentId: connection.environmentId,
          label: connection.environmentLabel,
          icon: (isRelayManagedConnection(connection) ? "cloud" : "terminal") as AppSymbolName,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [savedConnectionsById],
  );
  const availableEnvironmentIds = useMemo(
    () => new Set<EnvironmentId>(environments.map((environment) => environment.environmentId)),
    [environments],
  );
  const { options, setSelectedEnvironmentId } = useHomeListOptions(availableEnvironmentIds);
  const selectedEnvironmentId = options.selectedEnvironmentId;

  return (
    <View
      style={{
        width: props.maxWidth,
        flex: props.maxWidth === undefined ? 1 : undefined,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
      }}
    >
      <Pressable
        accessibilityLabel="Settings"
        accessibilityRole="button"
        hitSlop={8}
        onPress={props.onOpenSettings}
        className="active:opacity-60"
      >
        <T3Wordmark height={18} colorClassName="accent-icon" />
      </Pressable>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ alignItems: "center", gap: 4, paddingRight: 4 }}
      >
        <EnvironmentPill
          label="All"
          selected={selectedEnvironmentId === null}
          onPress={() => setSelectedEnvironmentId(null)}
        />
        {environments.map((environment) => (
          <EnvironmentPill
            key={String(environment.environmentId)}
            label={environment.label}
            icon={environment.icon}
            selected={selectedEnvironmentId === environment.environmentId}
            onPress={() => setSelectedEnvironmentId(environment.environmentId)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function EnvironmentPill(props: {
  readonly label: string;
  readonly icon?: AppSymbolName;
  readonly selected: boolean;
  readonly onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={props.label}
      accessibilityRole="button"
      accessibilityState={{ selected: props.selected }}
      hitSlop={4}
      onPress={props.onPress}
      className={cn(
        "flex-row items-center gap-1.5 rounded-full px-2.5 py-1",
        props.selected ? "bg-subtle" : "active:opacity-60",
      )}
    >
      {props.icon ? (
        <SymbolView
          name={props.icon}
          size={13}
          tintColorClassName={props.selected ? "accent-icon" : "accent-icon-muted"}
          type="monochrome"
        />
      ) : null}
      <Text
        textRole="footnote"
        numberOfLines={1}
        className={cn(
          "max-w-[132px] font-t3-medium",
          props.selected ? "text-foreground" : "text-foreground-muted",
        )}
      >
        {props.label}
      </Text>
    </Pressable>
  );
}
