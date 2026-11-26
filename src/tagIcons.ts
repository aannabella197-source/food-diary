// Tag icon library, default icons for standard tags and the one-time icon update.
import {
  Apple, Beef, Bike, Briefcase, CakeSlice, Carrot, Cherry, Coffee, Cookie, Croissant, CupSoda, Dumbbell, Fish, Footprints, GlassWater, Heart, House, Milk, MoonStar, Nut, Pill, Salad, Soup, Sofa, Sunrise, Tag, Utensils, Wheat, WheatOff, Wine,
} from 'lucide-react';
import { BroomIcon, CoffeeBeanIcon, SmoothieIcon, TomatoIcon } from './components/CustomIcons';

export const tagIconOptions = [
  { value: 'utensils', label: 'Еда', Icon: Utensils },
  { value: 'coffee', label: 'Чашка', Icon: Coffee },
  { value: 'coffee-bean', label: 'Кофе', Icon: CoffeeBeanIcon },
  { value: 'apple', label: 'Фрукты', Icon: Apple },
  { value: 'salad', label: 'Салат', Icon: Salad },
  { value: 'soup', label: 'Суп', Icon: Soup },
  { value: 'fish', label: 'Рыба', Icon: Fish },
  { value: 'glass-water', label: 'Вода', Icon: GlassWater },
  { value: 'cup-soda', label: 'Напиток', Icon: CupSoda },
  { value: 'smoothie', label: 'Смузи', Icon: SmoothieIcon },
  { value: 'wine', label: 'Вино', Icon: Wine },
  { value: 'cake-slice', label: 'Десерт', Icon: CakeSlice },
  { value: 'cookie', label: 'Печенье', Icon: Cookie },
  { value: 'croissant', label: 'Выпечка', Icon: Croissant },
  { value: 'wheat', label: 'Злаки', Icon: Wheat },
  { value: 'milk', label: 'Молочное', Icon: Milk },
  { value: 'carrot', label: 'Морковь', Icon: Carrot },
  { value: 'tomato', label: 'Помидор', Icon: TomatoIcon },
  { value: 'breakfast', label: 'Завтрак', Icon: Sunrise },
  { value: 'dinner', label: 'Ужин', Icon: MoonStar },
  { value: 'wheat-off', label: 'Без глютена', Icon: WheatOff },
  { value: 'beef', label: 'Мясное', Icon: Beef },
  { value: 'nut', label: 'Орехи', Icon: Nut },
  { value: 'cherry', label: 'Вишни', Icon: Cherry },
  { value: 'broom', label: 'Метла', Icon: BroomIcon },
  { value: 'pill', label: 'Таблетка', Icon: Pill },
  { value: 'dumbbell', label: 'Тренировка', Icon: Dumbbell },
  { value: 'footprints', label: 'Прогулка', Icon: Footprints },
  { value: 'bike', label: 'Велосипед', Icon: Bike },
  { value: 'heart', label: 'Здоровье', Icon: Heart },
  { value: 'house', label: 'Дом', Icon: House },
  { value: 'briefcase', label: 'Работа', Icon: Briefcase },
  { value: 'sofa', label: 'Отдых', Icon: Sofa },
  { value: 'tag', label: 'Общее', Icon: Tag },
];

// Icons used for tags that have no icon chosen by the user.
export const defaultTagIcons: Record<string, string> = {
  'завтрак': 'breakfast',
  'обед': 'soup',
  'ужин': 'dinner',
  'перекус': 'cookie',
  'фрукты': 'apple',
  'десерт': 'cake-slice',
  'овощи': 'tomato',
  'мучное': 'croissant',
  'крупы': 'wheat',
  'без глютена': 'wheat-off',
  'молочное': 'milk',
  'мясное': 'beef',
  'рыба': 'fish',
  'ягоды': 'cherry',
  'вишни': 'cherry',
  'орехи': 'nut',
  'таблетки': 'pill',
  'вода': 'glass-water',
  'безалкогольные напитки': 'cup-soda',
  'чай': 'coffee',
  'кофе': 'coffee-bean',
  'смузи': 'smoothie',
  'алкогольные напитки': 'wine',
  'прогулка': 'footprints',
  'домашние дела': 'broom',
  'тренировка': 'dumbbell',
  'отдых': 'sofa',
  'работа': 'briefcase',
};

export function defaultTagIcon(tag: string) {
  return defaultTagIcons[tag.trim().toLocaleLowerCase('ru')] || 'tag';
}

// One-time update (November 2026): give some existing tags their new icons,
// but only where the tag still has the old icon, so manual choices are kept.
export const ICON_UPDATE_KEY = 'food-diary-icon-update-1';
export const iconUpdates: { tag: string; from: string; to: string }[] = [
  { tag: 'перекус', from: 'utensils', to: 'cookie' },
  { tag: 'мучное', from: 'wheat', to: 'croissant' },
  { tag: 'безалкогольные напитки', from: 'glass-water', to: 'cup-soda' },
  { tag: 'смузи', from: 'glass-water', to: 'smoothie' },
  { tag: 'алкогольные напитки', from: 'glass-water', to: 'wine' },
  { tag: 'кофе', from: 'coffee', to: 'coffee-bean' },
  { tag: 'таблетки', from: 'heart', to: 'pill' },
];

export function applyIconUpdate(icons: Record<string, string>) {
  try {
    if (localStorage.getItem(ICON_UPDATE_KEY)) return icons;
    localStorage.setItem(ICON_UPDATE_KEY, 'done');
  } catch {
    return icons;
  }
  const next = { ...icons };
  for (const [tag, icon] of Object.entries(icons)) {
    const update = iconUpdates.find((item) => item.tag === tag.trim().toLocaleLowerCase('ru'));
    if (update && icon === update.from) next[tag] = update.to;
  }
  return next;
}
