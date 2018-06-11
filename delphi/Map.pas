unit Map;

interface
uses Graphics, Constant1;

type TMap = class(TObject)

private
    Cell: array [0 .. MAP_WIDTH - 1] of
          array [0 .. MAP_HEIGHT - 1] of byte;

public
    constructor Create;

    procedure Clear;
    procedure Seed;

    procedure NewCellAge(X, Y: Integer; M: TMap);
    function CellColor(X, Y: Integer): TColor;

    procedure Update(M: TMap);

private
    procedure PopulateCell(X, Y, CellType: Integer);
    function CellValue(X, Y: Integer): Integer;
    function CellAge(X, Y: Integer): Integer;
    function CellType(X, Y: Integer): Integer;

end;

implementation

constructor TMap.Create();
begin
    inherited Create();
end;

procedure TMap.Clear;
var
    X, Y: Integer;
begin
    for X := 0 to MAP_WIDTH - 1 do
        for Y := 0 to MAP_HEIGHT - 1 do
            Cell[X,Y] := 0
end;

procedure TMap.Seed;
var
    loop: Integer;
begin
    for loop := 1 to 10 do
        PopulateCell(Random(MAP_WIDTH), Random(MAP_HEIGHT), Random(3)+1)
end;

procedure TMap.NewCellAge(X, Y: Integer; M: TMap);
begin
    if M.CellAge(X, Y) > 3 then
        Cell[X, Y] := M.CellValue(X, Y) - 4
    else
        Cell[X, Y] := 0
end;

function TMap.CellColor(X, Y: Integer): TColor;
var
    CurrentCell, Intensity, CellType: Integer;
begin
    CurrentCell := Cell[X, Y];
    Intensity := CELL_AGE_MASK and CurrentCell; {First 6 Bits}
    CellType := CELL_TYPE_MASK and CurrentCell; {Last  2 Bits}
    if CellType > 0 then
        CellColor := TColor(Intensity shl ((CellType - 1) * 8))
    else
        CellColor := TColor($000000)
end;

procedure TMap.Update(M: TMap);
var
    X, Y, i, j, NewCellType: Integer;
begin
  for X := 0 to MAP_WIDTH - 1 do
       for Y := 0 to MAP_HEIGHT - 1 do
      begin
{          i := (X + Random(3) + MAP_WIDTH - 1) mod MAP_WIDTH;
           j := (Y + Random(3) + MAP_HEIGHT - 1) mod MAP_HEIGHT;
}
         i := RandomPosition(X, MAP_WIDTH);
         j := RandomPosition(Y, MAP_HEIGHT);
        NewCellType := M.CellType(i, j);
        if (NewCellType > 0) then
          if (M.CellType(X, Y) <> NewCellType) then
            PopulateCell(X, Y, NewCellType)
          else
            NewCellAge(X, Y, M)
        else
          NewCellAge(X, Y, M)
      end;
end;

procedure TMap.PopulateCell(X, Y, CellType: Integer);
begin
    Cell[X,Y] := CELL_AGE_MASK or CELL_TYPE_MASK and CellType
end;

function TMap.CellValue(X, Y: Integer): Integer;
begin
    CellValue := Cell[X,Y]
end;

function TMap.CellAge(X, Y: Integer): Integer;
begin
    CellAge := Cell[X,Y] and CELL_AGE_MASK
end;

function TMap.CellType(X, Y: Integer): Integer;
begin
    CellType := Cell[X,Y] and CELL_TYPE_MASK
end;

end.
