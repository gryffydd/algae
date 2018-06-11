import java.awt.Color;

class Cell {
    static boolean debug = false;
    int cell = 0;
    final static int CELL_TYPE_MASK = 0x03;
    final static int CELL_AGE_MASK = 0xfc;

    Cell (int type, int age) {
        cell = type == 0 ? 0 : type & CELL_TYPE_MASK | age & CELL_AGE_MASK;
        if (debug) System.out.println("Cell: int type = " + type + ", int age = " + age + ", int cell = " + cell);
    }

    Cell (int type) {
        this(type, CELL_AGE_MASK);
        if (debug) System.out.println("Cell: int type = " + type + ", int cell = " + cell);
    }

    Cell () {
        this(0);
        if (debug) System.out.println("Cell: int cell = " + cell);
    }

    void setAge (int age) {
        cell = ((age == 0) ? 0 : cell & CELL_TYPE_MASK | age & CELL_AGE_MASK);
        if (debug) System.out.println("int age = " + age + ", int cell = " + cell);
    }

    void setType (int type) {
        cell = ((type == 0) ? 0 : type & CELL_TYPE_MASK | CELL_AGE_MASK);
        if (debug) System.out.println("setAge: int type = " + type + ", int cell = " + cell);
    }

    void setTypeAge (int type, int age) {
        if (type <= 0 || age <= 0)
            cell = 0;
        else
            cell = type & CELL_TYPE_MASK | age & CELL_AGE_MASK;
        if (debug) System.out.println("setTypeAge: int type = " + type + ", int age = " + age + ", int cell = " + cell);
    }

    int getAge () {
        if (debug) System.out.println("getAge: int cell = " + cell);
        return cell & CELL_AGE_MASK;
    }

    int getType () {
        if (debug) System.out.println("getType: int cell = " + cell);
        return cell & CELL_TYPE_MASK;
    }

    Color colour () {
        int type = CELL_TYPE_MASK & cell;
        if (type > 0) {
            int age = CELL_AGE_MASK & cell;
            return new Color(age << ((type - 1) << 3));
        } else {
            return new Color(0);
        }
    }

    static void setDebug(boolean debug) { Cell.debug = debug; }
}
