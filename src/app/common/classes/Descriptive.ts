export class Descriptive {

    static mean(data: number[]): number {
        return Descriptive.sum(data) / data.length;
    }

    static median(data: number[]): number {
        const sortedDataset = data.sort((left, right) => left - right);
        const middleIndex = sortedDataset.length / 2;

        if (!this.isEven(data.length)) {
            const index = Math.floor(middleIndex);
            return sortedDataset[index];
        }
        const lowerIndex = middleIndex - 1;
        return (sortedDataset[lowerIndex] + sortedDataset[middleIndex]) / 2;

    }

    static max(data: number[]): number {
        return data.reduce((left, right) => left > right ? left : right, -Infinity);
    }

    static mode(data: number[]): number[] {
        const table = Descriptive.table(data);
        const maximum = Descriptive.max(data);
        const isMax = key => table[key] === maximum;
        const toNum = key => Number(key);

        return Object
            .keys(table)
            .filter(isMax)
            .map(toNum);
    }

    static variance(data: number[]): number {
        const dataMean = Descriptive.mean(data);
        const squared = val => Math.pow(val, 2);
        const calcVariance = val => squared(val - dataMean);
        const variances = data.map(calcVariance);
        return this.sum(variances) / data.length;
    }

    static stdDev(data: number[]): number {
        const populationVariance = Descriptive.variance(data);
        return Math.sqrt(populationVariance);
    }

    static sum(data: number[]) {
        return data.reduce((left, right) => left + right, 0);
    }

    static isEven(value: number): boolean {
        return value % 2 === 0;
    }

    static table(data: number[]): Dataset {
        const addFreq = (freqs, val) => { freqs[val] = (freqs[val] || 0) + 1; return freqs; }
        return data.reduce(addFreq, {});
    }


}

export interface Dataset {
    [index: string]: number;
}