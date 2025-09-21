export type Actor = 'FLO' | 'PAB' | 'LOT';

interface ActorStyles {
  colorClass: string;
  alignClass: string;
  actorName: string;
}

export const actorStyles: Record<Actor, ActorStyles> = {
  FLO: {
    colorClass: 'text-blue',
    alignClass: 'align-center',
    actorName: 'Flokrates',
  },
  PAB: {
    colorClass: 'text-orange',
    alignClass: 'align-left',
    actorName: 'Pablo',
  },
  LOT: {
    colorClass: 'text-pink',
    alignClass: 'align-right',
    actorName: 'Lotharius',
  },
};
