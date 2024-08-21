import * as moment from "moment";

import { Measure } from "./measure.model";

describe('Measure', () => {
  it('should create an instance', () => {
    expect(new Measure(moment(), 1)).toBeTruthy();
  });
});
