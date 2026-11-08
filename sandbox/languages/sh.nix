{ lib, busybox, ... }:
{
  source = "main.sh";
  run = [ (lib.getExe' busybox "sh") "main.sh" ];
  env = [ "PATH=${lib.makeBinPath [ busybox ]}" ];
}
