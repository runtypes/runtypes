import { Record, String } from '..';

describe('record', () => {
  const CrewMember = Record({
    name: String,
    rank: String,
    home: String,
  });

  describe('pick', () => {
    const PetMember = CrewMember.pick(['name', 'home']);

    it('keeps only selected fields', () => {
      expect(Object.keys(PetMember.fields)).toEqual(['name', 'home']);
    });
  });

  describe('omit', () => {
    const PetMember = CrewMember.omit(['name', 'home']);

    it('drop selected fields', () => {
      expect(Object.keys(PetMember.fields)).toEqual(['rank']);
    });
  });
});
