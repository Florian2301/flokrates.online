export type Actor = 'FLO' | 'PAB' | 'LOT';

interface ActorStyle {
  colorClass: string;
  alignClass: string;
  name: string;
}

export const actorStyles: Record<Actor, ActorStyle> = {
  FLO: {
    colorClass: 'text-blue',
    alignClass: 'align-center',
    name: 'Flokrates',
  },
  PAB: {
    colorClass: 'text-orange',
    alignClass: 'align-left',
    name: 'Pablo',
  },
  LOT: {
    colorClass: 'text-pink',
    alignClass: 'align-right',
    name: 'Lotharius',
  },
};
