program AlgaeOne;

uses
  Forms,
  Algae in 'Algae.pas' {DisplayForm},
  Constant1 in 'Constant1.pas',
  Map in 'Map.pas';

{$R *.RES}

begin
  Application.Initialize;
  Application.CreateForm(TDisplayForm, DisplayForm);
  Application.Run;
end.
