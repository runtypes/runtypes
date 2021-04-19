import { Record, String, Static } from '..';

describe('record', () => {
  const CrewMember = Record({
    name: String,
    rank: String,
    home: String,
  });

  describe('pick', () => {
    const PetMember = CrewMember.pick('name', 'home');
    type PetMember = Static<typeof PetMember>;
    const petMember: PetMember = { name: '', home: '' };

    it('keeps only selected fields', () => {
      expect(Object.keys(PetMember.fields)).toEqual(['name', 'home']);
      expect(PetMember.guard(petMember)).toBe(true);
    });
  });

  describe('omit', () => {
    const PetMember = CrewMember.omit('name', 'home');
    type PetMember = Static<typeof PetMember>;
    const petMember: PetMember = { rank: '' };

    it('drop selected fields', () => {
      expect(Object.keys(PetMember.fields)).toEqual(['rank']);
      expect(PetMember.guard(petMember)).toBe(true);
    });
  });
});
