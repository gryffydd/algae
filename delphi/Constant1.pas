unit Constant1;

interface

function RandomPosition(Pos, Max: Integer): Integer;

const
   PI = 3.141592756;
   TWOPI = PI * 2;

   CELL_TYPE_MASK = 3;
   CELL_AGE_MASK = 252;

   MAP_WIDTH = 256;
   MAP_HEIGHT = 256;

   WINDOW_WIDTH = 256;
   WINDOW_HEIGHT = 256;

implementation

function RandomPosition(Pos, Max: Integer): Integer;
begin
  { First Random Weighting
  RandomPosition := (Pos + Random(3) + Max - 1) mod Max;
  }
  { Second Random Weighting
  RandomPosition := (Pos + Random(2) + Random(2) + Max - 1) mod Max;
  }
  RandomPosition := (Pos
        + Random(2) + Random(2) - 1
        + Random(2) + Random(2) - 1
        + Max) mod Max;
end;

end.
