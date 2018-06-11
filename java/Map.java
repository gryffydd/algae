//import java.util.Random;

class Map {
    final static int CELL_TYPE_MASK = 0x03;
    final static int CELL_AGE_MASK = 0xfc;

    static boolean debug = false;

    static RandomPlus r = new RandomPlus();

    int[] typeCount = new int[4];
    Cell[] cells;
    int height;
    int width;

    Map() {
        this(4, 4);
        if (debug) System.out.println("New Map! Default - 4,4");
    }

    Map(int square) {
        this(square, square);
        if (debug) System.out.println("New Map! Square: " + square);
    }

    Map(int height, int width) {
        if (debug) System.out.println("New Map! height = " + height + ", width = " + width);
        this.height = height;
        this.width = width;
        cells = new Cell[height*width];
        this.initialise();
        if (debug) System.out.println("New Map done!  Cells: " + cells.length);
    }


    void initialise() {
        if (debug) System.out.println("initialise Map!");
        for (int i = 0; i < cells.length; i++)
            cells[i] = new Cell();
        updateTypeCount();
        //    if (debug) System.out.println("initialise Map done!  Cells: " + cells.length);
    }

    void seed(int minseeds, int maxseeds) {
        int seeds = Math.max(1, maxseeds - minseeds);
        if (debug) System.out.println("Seed Map! Seeds: " + minseeds + " -> " + maxseeds);
        seeds = Math.max(1, r.nextInt(seeds) + minseeds);
        if (debug) System.out.println("Seeding Map with " + seeds + " random seeds!");
        for (int i = 0; i < seeds; i++) {
            cells[r.nextInt(cells.length)].setType(r.nextInt(3) + 1);
            //    if (debug) System.out.println("cells[r.nextInt(cells.length)].setType(r.nextInt(3) + 1); - " + i);
        }
        updateTypeCount();
        if (debug) System.out.println("Seed Map done!  Cells: " + cells.length);
        try { Thread.sleep(1000); } catch ( Exception e ) { }
    }

    void updateTypeCount() {
        if (debug) System.out.println("updateTypeCount Map!");
        for (int i = 0; i <= CELL_TYPE_MASK; i++)
            typeCount[i] = 0;
        for (int i = 0; i < cells.length; i++)
            typeCount[cells[i].getType()]++;
    }

    void update(Map map) {
        int i, j, type;
        if (debug) System.out.println("Update Map!");
        for (int x = 0; x < width; x++) {
            for (int y = 0; y < height; y++) {
                i = (x + r.nextBin(4)) % width;
                if (i < 0) i += width;
                j = (y + r.nextBin(4)) % height;
                if (j < 0) j += height;
                type = map.cell(i, j).getType();
                if (type > 0 && type != cell(x, y).getType()) {
                    cell(x, y).setType(type);
                    if (debug) System.out.println("Assign New Cell - x: " + x + ", y: " + y );
                } else {
                    cell(x, y).setTypeAge(map.cell(x, y).getType(), map.cell(x, y).getAge() - 4);
                    if (debug) System.out.println("Age Old Cell - x: " + x + ", y: " + y );
                }
            }
        }
        updateTypeCount();
        if (debug) System.out.println("Update Map done!");
    }

    Cell cell(int x, int y) {
        if (debug) System.out.println("Cell(" + this + ") - x: " + x + ", y: " + y + ", offset: " + ((x + height) % height) + " - " + ((y + width) % width) * height + " - " + (x + y * height));
        return cells[(x + y * height)];
    }

    void dump() {
        int i;
        System.out.println("Dump Map!");
        System.out.println("\tHeight: " + height + " Width: " + width + " Cells: " + cells.length);
        System.out.println("\tContent:");
        for (int x = 0; x < height; x++) {
            System.out.print("\t\t");
            for (int y = 0; y < width; y++) {
                i = x * width + y;
                System.out.format("%02d:%s:%s\t", i, Integer.toHexString(cells[i].getType()), Integer.toHexString(cells[i].getAge()));
            }
            System.out.println();
        }
        System.out.println("\tCell Type Count: ");
        for (i = 0; i <= CELL_TYPE_MASK; i++)
            System.out.println("\t\tTypeCount[" + i + "]: " + typeCount[i] );
    }

    static void setDebug(boolean debug) { Map.debug = debug; }
}
