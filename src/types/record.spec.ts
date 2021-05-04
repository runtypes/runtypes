import { Record, String, Static } from '..';
import { Literal } from './literal';
import { Number } from './number';
import { Optional } from './optional';
import { Never } from './never';

describe('record', () => {
  it('should work with never properties', () => {
    const R = Record({ foo: Never });
    type R = Static<typeof R>;
    // https://github.com/microsoft/TypeScript/issues/43954
    // @ts-ignore
    const r: R = {};
    expect(R.guard({ foo: true })).toBe(false);
    expect(R.guard(r)).toBe(true);
  });

  const CrewMember = Record({
    name: String,
    rank: String,
    home: String,
  });

  describe('pick', () => {
    it('keeps only selected fields', () => {
      const PetMember = CrewMember.pick('name', 'home');
      type PetMember = Static<typeof PetMember>;
      const petMember: PetMember = { name: '', home: '' };
      expect(Object.keys(PetMember.fields)).toEqual(['name', 'home']);
      expect(PetMember.guard(petMember)).toBe(true);
    });
    it('works with empty arguments', () => {
      const PetMember = CrewMember.pick();
      type PetMember = Static<typeof PetMember>;
      const petMember: PetMember = {};
      expect(Object.keys(PetMember.fields)).toEqual([]);
      expect(PetMember.guard(petMember)).toBe(true);
    });
  });

  describe('omit', () => {
    it('drop selected fields', () => {
      const PetMember = CrewMember.omit('name', 'home');
      type PetMember = Static<typeof PetMember>;
      const petMember: PetMember = { rank: '' };
      expect(Object.keys(PetMember.fields)).toEqual(['rank']);
      expect(PetMember.guard(petMember)).toBe(true);
    });
    it('works with empty arguments', () => {
      const PetMember = CrewMember.omit();
      type PetMember = Static<typeof PetMember>;
      const petMember: PetMember = { name: '', home: '', rank: '' };
      expect(Object.keys(PetMember.fields)).toEqual(['name', 'rank', 'home']);
      expect(PetMember.guard(petMember)).toBe(true);
    });
  });

  describe('extend', () => {
    it('adds fields', () => {
      const BaseShapeParams = Record({
        x: Number,
        y: Number,
        width: Number,
        height: Number,
        rotation: Number,
      });
      const PolygonParams = BaseShapeParams.extend({
        sides: Number,
      });
      expect(Object.keys(PolygonParams.fields)).toEqual([
        'x',
        'y',
        'width',
        'height',
        'rotation',
        'sides',
      ]);
    });
    it('overwrites with a narrower type', () => {
      // @ts-ignore
      const WrongPetMember = CrewMember.extend({ name: Optional(String) });
      const PetMember = CrewMember.extend({ name: Literal('pet') });
      type PetMember = Static<typeof PetMember>;
      const petMember: PetMember = { name: 'pet', home: '', rank: '' };
      const anotherMember = { name: 'another', home: '', rank: '' };
      expect(PetMember.guard(petMember)).toBe(true);
      expect(PetMember.guard(anotherMember)).toBe(false);
    });
  });
});
