import java.awt.*;
import java.awt.event.*;
//import javax.swing.*;

class Algae extends Frame /* implements ItemListener */ {

    /**
     * 
     */
    private static final long serialVersionUID = 1L;

    public Algae(String title) {
        super(title);
        addWindowListener(new WindowAdapter() {
            public void windowClosing(WindowEvent ev) {
                System.exit(0);
            }
        });
        setPreferredSize(new Dimension(60, 60));
        pack();
        setVisible(true);
    }

    public Algae() {
        this("Algae");
    }

    public static void main (String[] args) {
        long tick;
        Map map[];

        System.out.println("Algae!");
        // Cell.setDebug(true);

        // Algae a = new Algae("Algae A");

        System.out.println("\tcreate Map Array");
        map = new Map[2];
        System.out.println("\t\tcreate first Map");
        map[0] = new Map(8);
        map[1] = new Map(8);

        map[0].seed(4,8);
        map[0].dump();

        for (tick = 1; true ; tick++) {
            System.out.println("Algae - Tick: " + tick);
            map[(int) tick % 2].update(map[(int) (tick - 1) % 2]);
            map[(int) tick % 2].dump();
            try { Thread.sleep(500); } catch ( Exception e ) { }
        }

        //    System.out.println("Algae Completed!");
    }
}
