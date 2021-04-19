import { Record, String, Static } from '..';

describe('record', () => {
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
});
