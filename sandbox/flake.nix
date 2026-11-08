{
  inputs = {
    nixpkgs.url = "https://channels.nixos.org/nixpkgs-unstable/nixexprs.tar.zst";
  };

  outputs = inputs: {
    packages = builtins.mapAttrs (system: pkgs: {
      default = pkgs.callPackage ./image.nix { languages = import ./languages pkgs; };
    }) inputs.nixpkgs.legacyPackages;
  };
}
