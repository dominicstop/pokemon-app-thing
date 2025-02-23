export class CommonHelpers {

  // eslint-disable-next-line consistent-this
  static async setStateAsync<T extends {}>(
    that: React.Component,
    newState: T | ((prevState: T) => T)
  ){
    return new Promise<void>((resolve) => {
      that.setState(newState, () => {
        resolve();
      });
    });
  };

  static async timeout(ms: number) {
    return new Promise<void>(resolve => {
      const timeoutID = setTimeout(() => {
        clearTimeout(timeoutID);
        resolve();
      }, ms);
    });
  };

  static async promiseWithTimeout<T>(ms: number, promise: Promise<T>){
    const timeoutPromise = new Promise<T>((_, reject) => {
      const timeoutID = setTimeout(() => {
        clearTimeout(timeoutID);
        reject(`Promise timed out in ${ms} ms.`)
      }, ms);
    });

    return Promise.race([promise, timeoutPromise]);
  };

  static pad(num: number | string, places = 2){
    return String(num).padStart(places, '0');
  };
};