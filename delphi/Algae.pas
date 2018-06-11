unit Algae;

interface

uses
  Windows, Messages, SysUtils, Classes, Graphics, Controls, Forms, Dialogs,
  ExtCtrls, Map, Constant1, Menus;

type
    TDisplayForm = class(TForm)
    Timer: TTimer;
    PopupMenu: TPopupMenu;
    Reset: TMenuItem;
    procedure FormCreate(Sender: TObject);
    procedure FormPaint(Sender: TObject);
    procedure TimerPulse(Sender: TObject);
    procedure FormReset(Sender: TObject);
    procedure ShowPopup(Sender: TObject);
  private
    procedure DrawBitmap;
    procedure CopyMapToBitmap(Frame: Integer);
  public

  end;

var
    DisplayForm: TDisplayForm;
    Bitmap: TBitmap;
    Maps: array [0..1] of TMap;
    Tick: Longint;

implementation

{$R *.DFM}

procedure TDisplayForm.FormCreate(Sender: TObject);
begin
    Bitmap := TBitmap.Create;
    Bitmap.Width := MAP_WIDTH;
    Bitmap.Height := MAP_HEIGHT;

    Randomize;
    Tick := 0;
    Maps[0] := TMap.Create;
    Maps[1] := TMap.Create;
    Maps[0].Clear;
    Maps[0].Seed;
    CopyMapToBitmap(0);

    { Call these here as it causes the FormPaint to be called }
    ClientWidth := WINDOW_WIDTH;
    ClientHeight := WINDOW_HEIGHT
end;

procedure TDisplayForm.FormPaint(Sender: TObject);
begin
    DrawBitmap;
end;

procedure TDisplayForm.TimerPulse(Sender: TObject);
var
    OldFrame, NewFrame: Integer;
begin
    OldFrame := Tick mod 2;
    NewFrame := (Tick + 1) mod 2;
    Inc(Tick);
    Maps[NewFrame].Update(Maps[OldFrame]);
    CopyMapToBitmap(NewFrame);
    DrawBitmap
end;

procedure TDisplayForm.DrawBitmap;
var
    rScreen: TRect;
begin
    rScreen.Left := 0;
    rScreen.Top := 0;
    rScreen.Right := ClientWidth;
    rScreen.Bottom := ClientHeight;
    Canvas.StretchDraw(rScreen, Bitmap);
end;

procedure TDisplayForm.CopyMapToBitmap(Frame: Integer);
var
    X, Y: Integer;
begin
    for X := 0 to MAP_WIDTH - 1 do
    begin
        for Y := 0 to MAP_HEIGHT - 1 do
        begin
            Bitmap.Canvas.Pixels[X, Y] := maps[Frame].CellColor(X, Y);
        end;
    end;
end;

procedure TDisplayForm.FormReset(Sender: TObject);
var
    Frame: Integer;
begin
    Frame := Tick mod 2;
    Maps[Frame].Clear;
    Maps[Frame].Seed
end;

procedure TDisplayForm.ShowPopup(Sender: TObject);
begin
    PopupMenu.Popup(128, 128)
end;

end.
