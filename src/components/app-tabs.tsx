import { NativeTabs } from 'expo-router/native-tabs';

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor="#ffffff"
      tintColor="#0877ED"
      indicatorColor="#DCEBFF"
      labelStyle={{ default: { color: '#82918d' }, selected: { color: '#0877ED', fontWeight: '700' } }}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Accueil</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="booking">
        <NativeTabs.Trigger.Label>Réserver</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'calendar', selected: 'calendar' }}
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="widget">
        <NativeTabs.Trigger.Label>Widget</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'heart', selected: 'heart.fill' }}
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
