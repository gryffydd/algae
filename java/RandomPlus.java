import java.util.Random;

class RandomPlus extends Random {

    int nextBin(int spread, int offset) {
        int next = next(spread), total = -offset;
        // System.out.println("Spread: " + spread + " - Offset: " + offset + " - Next: " + next );
        for (int x = 0; x < spread; x++) {
            total += next % 2;
            next /= 2;
            // System.out.println("Total: " + total + " - Next: " + next );
        }
        return total;
    }

    int nextBin(int spread) {
        return nextBin(spread, spread/2);
    }
}
