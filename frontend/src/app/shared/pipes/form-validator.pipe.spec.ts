import { FormValidatorPipe } from './form-validator.pipe';

describe('FormValidatorPipe', () => {
   it('create an instance', () => {
      const pipe = new FormValidatorPipe();
      expect(pipe).toBeTruthy();
   });
});
