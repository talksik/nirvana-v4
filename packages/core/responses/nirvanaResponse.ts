// TODO: enforce this or the other sort of thing for the class
// type INirvanaResponse<T> =
//   | {
//       data: T;
//       error?: Error;
//     }
//   | { data?: T; error: Error };

export default class NirvanaResponse<T> {
  data?: T;
  error?: Error;
  message?: string;

  constructor(_data: T, _error?: Error, _message?: string) {
    this.data = _data;
    this.error = _error;

    this.message = _message;
  }
}
