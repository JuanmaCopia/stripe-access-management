#!/bin/bash
# Setup AI Skills for Prowler development
# Configures AI coding assistants that follow agentskills.io standard:
#   - Claude Code: .claude/skills/ + CLAUDE.md -> .agents/AGENTS.md
#   - Gemini CLI: .gemini/skills/ + GEMINI.md -> .agents/AGENTS.md
#   - Codex (OpenAI): .codex/skills/ + AGENTS.md -> .agents/AGENTS.md
#   - OpenCode: .opencode/skills/ + AGENTS.md -> .agents/AGENTS.md
#   - Google Antigravity: .agent/skills/ + .agent/rules/rules.md -> .agents/AGENTS.md
#
# Usage:
#   ./setup.sh              # Interactive mode (select AI assistants)
#   ./setup.sh --all        # Configure all AI assistants
#   ./setup.sh --claude     # Configure only Claude Code
#   ./setup.sh --claude --codex  # Configure multiple

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
SKILLS_SOURCE="$(dirname "$SCRIPT_DIR")/skills"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Selection flags
SETUP_CLAUDE=false
SETUP_GEMINI=false
SETUP_CODEX=false
SETUP_OPENCODE=false
SETUP_ANTIGRAVITY=false

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Configure AI coding assistants for Prowler development."
    echo ""
    echo "Options:"
    echo "  --all          Configure all AI assistants"
    echo "  --claude       Configure Claude Code"
    echo "  --gemini       Configure Gemini CLI"
    echo "  --codex        Configure Codex (OpenAI)"
    echo "  --opencode     Configure OpenCode"
    echo "  --antigravity  Configure Google Antigravity IDE"
    echo "  --help         Show this help message"
    echo ""
    echo "If no options provided, runs in interactive mode."
    echo ""
    echo "Examples:"
    echo "  $0                      # Interactive selection"
    echo "  $0 --all                # All AI assistants"
    echo "  $0 --claude --codex     # Only Claude and Codex"
}

show_menu() {
    echo -e "${BOLD}Which AI assistants do you use?${NC}"
    echo -e "${CYAN}(Use numbers to toggle, Enter to confirm)${NC}"
    echo ""

    local options=("Claude Code" "Gemini CLI" "Codex (OpenAI)" "OpenCode" "Google Antigravity IDE")
    local selected=(true false false false false)  # Claude selected by default

    while true; do
        for i in "${!options[@]}"; do
            if [ "${selected[$i]}" = true ]; then
                echo -e "  ${GREEN}[x]${NC} $((i+1)). ${options[$i]}"
            else
                echo -e "  [ ] $((i+1)). ${options[$i]}"
            fi
        done
        echo ""
        echo -e "  ${YELLOW}a${NC}. Select all"
        echo -e "  ${YELLOW}n${NC}. Select none"
        echo ""
        echo -n "Toggle (1-5, a, n) or Enter to confirm: "

        read -r choice

        case $choice in
            1) selected[0]=$([ "${selected[0]}" = true ] && echo false || echo true) ;;
            2) selected[1]=$([ "${selected[1]}" = true ] && echo false || echo true) ;;
            3) selected[2]=$([ "${selected[2]}" = true ] && echo false || echo true) ;;
            4) selected[3]=$([ "${selected[3]}" = true ] && echo false || echo true) ;;
            5) selected[4]=$([ "${selected[4]}" = true ] && echo false || echo true) ;;
            a|A) selected=(true true true true true) ;;
            n|N) selected=(false false false false false) ;;
            "") break ;;
            *) echo -e "${RED}Invalid option${NC}" ;;
        esac

        # Move cursor up to redraw menu
        echo -en "\033[11A\033[J"
    done

    SETUP_CLAUDE=${selected[0]}
    SETUP_GEMINI=${selected[1]}
    SETUP_CODEX=${selected[2]}
    SETUP_OPENCODE=${selected[3]}
    SETUP_ANTIGRAVITY=${selected[4]}
}

setup_claude() {
    local target="$REPO_ROOT/.claude/skills"

    if [ ! -d "$REPO_ROOT/.claude" ]; then
        mkdir -p "$REPO_ROOT/.claude"
    fi

    if [ -L "$target" ]; then
        rm "$target"
    elif [ -d "$target" ]; then
        mv "$target" "$REPO_ROOT/.claude/skills.backup.$(date +%s)"
    fi

    ln -s "$SKILLS_SOURCE" "$target"
    echo -e "${GREEN}  ✓ .claude/skills -> skills/${NC}"

    # Symlink CLAUDE.md -> .agents/AGENTS.md
    link_agents_md "CLAUDE.md"
}

setup_gemini() {
    local target="$REPO_ROOT/.gemini/skills"

    if [ ! -d "$REPO_ROOT/.gemini" ]; then
        mkdir -p "$REPO_ROOT/.gemini"
    fi

    if [ -L "$target" ]; then
        rm "$target"
    elif [ -d "$target" ]; then
        mv "$target" "$REPO_ROOT/.gemini/skills.backup.$(date +%s)"
    fi

    ln -s "$SKILLS_SOURCE" "$target"
    echo -e "${GREEN}  ✓ .gemini/skills -> skills/${NC}"

    # Symlink GEMINI.md -> .agents/AGENTS.md
    link_agents_md "GEMINI.md"
}

setup_codex() {
    local target="$REPO_ROOT/.codex/skills"

    if [ ! -d "$REPO_ROOT/.codex" ]; then
        mkdir -p "$REPO_ROOT/.codex"
    fi

    if [ -L "$target" ]; then
        rm "$target"
    elif [ -d "$target" ]; then
        mv "$target" "$REPO_ROOT/.codex/skills.backup.$(date +%s)"
    fi

    ln -s "$SKILLS_SOURCE" "$target"
    echo -e "${GREEN}  ✓ .codex/skills -> skills/${NC}"

    # Symlink AGENTS.md -> .agents/AGENTS.md
    link_agents_md "AGENTS.md"
}

setup_opencode() {
    local target="$REPO_ROOT/.opencode/skills"

    if [ ! -d "$REPO_ROOT/.opencode" ]; then
        mkdir -p "$REPO_ROOT/.opencode"
    fi

    if [ -L "$target" ]; then
        rm "$target"
    elif [ -d "$target" ]; then
        mv "$target" "$REPO_ROOT/.opencode/skills.backup.$(date +%s)"
    fi

    ln -s "$SKILLS_SOURCE" "$target"
    echo -e "${GREEN}  ✓ .opencode/skills -> skills/${NC}"

    # Symlink AGENTS.md -> .agents/AGENTS.md (shared with Codex)
    link_agents_md "AGENTS.md"
}

setup_antigravity() {
    local target="$REPO_ROOT/.agent/skills"

    if [ ! -d "$REPO_ROOT/.agent" ]; then
        mkdir -p "$REPO_ROOT/.agent"
    fi

    if [ -L "$target" ]; then
        rm "$target"
    elif [ -d "$target" ]; then
        mv "$target" "$REPO_ROOT/.agent/skills.backup.$(date +%s)"
    fi

    ln -s "$SKILLS_SOURCE" "$target"
    echo -e "${GREEN}  ✓ .agent/skills -> skills/${NC}"

    # Symlink .agent/rules/rules.md -> .agents/AGENTS.md
    link_agents_md ".agent/rules/rules.md"
}

link_agents_md() {
    local target_path="$REPO_ROOT/$1"
    local target_dir
    target_dir=$(dirname "$target_path")
    local agents_file="$REPO_ROOT/.agents/AGENTS.md"

    if [ ! -f "$agents_file" ]; then
        echo -e "${RED}  ✗ .agents/AGENTS.md not found${NC}"
        return 1
    fi

    mkdir -p "$target_dir"

    local rel_path
    rel_path=$(realpath --relative-to="$target_dir" "$agents_file")

    if [ -f "$target_path" ] && [ ! -L "$target_path" ]; then
        mv "$target_path" "${target_path}.backup.$(date +%s)"
    elif [ -L "$target_path" ]; then
        rm "$target_path"
    fi

    ln -s "$rel_path" "$target_path"
    echo -e "${GREEN}  ✓ $1 -> .agents/AGENTS.md${NC}"
}

# =============================================================================
# PARSE ARGUMENTS
# =============================================================================

while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            SETUP_CLAUDE=true
            SETUP_GEMINI=true
            SETUP_CODEX=true
            SETUP_OPENCODE=true
            SETUP_ANTIGRAVITY=true
            shift
            ;;
        --claude)
            SETUP_CLAUDE=true
            shift
            ;;
        --gemini)
            SETUP_GEMINI=true
            shift
            ;;
        --codex)
            SETUP_CODEX=true
            shift
            ;;
        --opencode)
            SETUP_OPENCODE=true
            shift
            ;;
        --antigravity)
            SETUP_ANTIGRAVITY=true
            shift
            ;;
        --help|-h)
            show_help
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_help
            exit 1
            ;;
    esac
done

# =============================================================================
# MAIN
# =============================================================================

echo "🤖 Prowler AI Skills Setup"
echo "=========================="
echo ""

# Count skills
SKILL_COUNT=$(find "$SKILLS_SOURCE" -maxdepth 2 -name "SKILL.md" | wc -l | tr -d ' ')

if [ "$SKILL_COUNT" -eq 0 ]; then
    echo -e "${RED}No skills found in $SKILLS_SOURCE${NC}"
    exit 1
fi

echo -e "${BLUE}Found $SKILL_COUNT skills to configure${NC}"
echo ""

# Interactive mode if no flags provided
if [ "$SETUP_CLAUDE" = false ] && [ "$SETUP_GEMINI" = false ] && [ "$SETUP_CODEX" = false ] && [ "$SETUP_OPENCODE" = false ] && [ "$SETUP_ANTIGRAVITY" = false ]; then
    show_menu
    echo ""
fi

# Check if at least one selected
if [ "$SETUP_CLAUDE" = false ] && [ "$SETUP_GEMINI" = false ] && [ "$SETUP_CODEX" = false ] && [ "$SETUP_OPENCODE" = false ] && [ "$SETUP_ANTIGRAVITY" = false ]; then
    echo -e "${YELLOW}No AI assistants selected. Nothing to do.${NC}"
    exit 0
fi

# Run selected setups
STEP=1
TOTAL=0
[ "$SETUP_CLAUDE" = true ] && TOTAL=$((TOTAL + 1))
[ "$SETUP_GEMINI" = true ] && TOTAL=$((TOTAL + 1))
[ "$SETUP_CODEX" = true ] && TOTAL=$((TOTAL + 1))
[ "$SETUP_OPENCODE" = true ] && TOTAL=$((TOTAL + 1))
[ "$SETUP_ANTIGRAVITY" = true ] && TOTAL=$((TOTAL + 1))

if [ "$SETUP_CLAUDE" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Setting up Claude Code...${NC}"
    setup_claude
    STEP=$((STEP + 1))
fi

if [ "$SETUP_GEMINI" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Setting up Gemini CLI...${NC}"
    setup_gemini
    STEP=$((STEP + 1))
fi

if [ "$SETUP_CODEX" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Setting up Codex (OpenAI)...${NC}"
    setup_codex
    STEP=$((STEP + 1))
fi

if [ "$SETUP_OPENCODE" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Setting up OpenCode...${NC}"
    setup_opencode
    STEP=$((STEP + 1))
fi

if [ "$SETUP_ANTIGRAVITY" = true ]; then
    echo -e "${YELLOW}[$STEP/$TOTAL] Setting up Google Antigravity IDE...${NC}"
    setup_antigravity
fi

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
echo -e "${GREEN}✅ Successfully configured $SKILL_COUNT AI skills!${NC}"
echo ""
echo "Configured:"
[ "$SETUP_CLAUDE" = true ] && echo "  • Claude Code:          CLAUDE.md -> .agents/AGENTS.md"
[ "$SETUP_CODEX" = true ] && echo "  • Codex (OpenAI):       AGENTS.md -> .agents/AGENTS.md"
[ "$SETUP_GEMINI" = true ] && echo "  • Gemini CLI:           GEMINI.md -> .agents/AGENTS.md"
[ "$SETUP_OPENCODE" = true ] && echo "  • OpenCode:             AGENTS.md -> .agents/AGENTS.md"
[ "$SETUP_ANTIGRAVITY" = true ] && echo "  • Google Antigravity:   .agent/rules/rules.md -> .agents/AGENTS.md"
echo ""
echo -e "${BLUE}Note: Restart your AI assistant to load the skills.${NC}"
echo -e "${BLUE}      .agents/AGENTS.md is the source of truth - all agent files symlink to it.${NC}"
