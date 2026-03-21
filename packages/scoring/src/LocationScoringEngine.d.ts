import { FactorKey, LocationScoringEngine, ScoringInput, ScoringResult } from './types';
export declare class LocationScoringEngineImpl implements LocationScoringEngine {
    private _simulatedValues;
    private _simulatedMissing;
    simulateFactorValues(values: Partial<Record<FactorKey, number>>): void;
    clearSimulatedValues(): void;
    simulateMissingFactors(factors: FactorKey[]): void;
    calculate(input: ScoringInput): Promise<ScoringResult>;
    private validateWeights;
    private fetchFactorScores;
    private redistributeWeights;
    private deriveConfidence;
}
//# sourceMappingURL=LocationScoringEngine.d.ts.map