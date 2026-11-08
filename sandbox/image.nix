{ lib, dockerTools, formats, writeTextDir, go-judge, coreutils, languages }:
let
  # ref: https://github.com/criyle/go-judge/blob/v1.14.0/mount.yaml
  mount = (formats.yaml { }).generate "mount.yaml" {
    mount = [
      { type = "bind"; source = "/nix/store"; target = "/nix/store"; readonly = true; }
      # go-judge runs /usr/bin/env at startup to probe its clone3 fast path.
      { type = "bind"; source = lib.getExe' coreutils "env"; target = "/usr/bin/env"; readonly = true; }
      { type = "bind"; source = "/dev/null"; target = "/dev/null"; }
      { type = "bind"; source = "/dev/urandom"; target = "/dev/urandom"; }
      { type = "tmpfs"; target = "/w"; data = "size=128m,nr_inodes=4k"; }
      { type = "tmpfs"; target = "/tmp"; data = "size=128m,nr_inodes=4k"; }
    ];
  };
in
dockerTools.buildLayeredImage {
  name = "sandbox";
  tag = "latest";

  contents = [ (writeTextDir "languages.json" (builtins.toJSON languages)) ];

  # go-judge creates its sandbox roots under /tmp.
  extraCommands = ''
    mkdir tmp
  '';

  config.Cmd = [ (lib.getExe go-judge) "-http-addr" "0.0.0.0:5050" "-mount-conf" mount ];
}
