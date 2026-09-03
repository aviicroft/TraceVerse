import os
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from pathlib import Path

ASSET_DIR = Path("data/ppt_assets")
ASSET_DIR.mkdir(parents=True, exist_ok=True)

# Set global styles
plt.rcParams['font.sans-serif'] = 'DejaVu Sans'
plt.rcParams['axes.edgecolor'] = '#334155'
plt.rcParams['axes.linewidth'] = 1.2


def generate_architecture_diagram():
    """Generates a clean, modern dark forensic architecture diagram."""
    fig, ax = plt.subplots(figsize=(12, 6.5), dpi=300)
    fig.patch.set_facecolor('#0b0f19')
    ax.set_facecolor('#0b0f19')
    ax.set_xlim(0, 12)
    ax.set_ylim(0, 6.5)
    ax.axis('off')

    # Title
    ax.text(6, 6.1, "TRACEVERSE: END-TO-END TECHNICAL ARCHITECTURE", 
            ha='center', va='center', color='#38bdf8', fontsize=14, weight='bold', fontfamily='monospace')
    ax.text(6, 5.7, "Multi-Chain Ingestion  •  5-Pillar Scoring  •  Graph Studio  •  Legal Notice Engine", 
            ha='center', va='center', color='#94a3b8', fontsize=9)

    # 5 Main Process Boxes
    boxes = [
        ("1. INGESTION", "• Ethereum (ETH/ERC20)\n• TRON (TRX/TRC20 USDT)\n• DB-First Disk Cache\n• Rate-Limit & Backoff", 1.2, '#1e293b', '#38bdf8'),
        ("2. GRAPH ENGINE", "• Directed Multi-Hop BFS\n• Depth <= 3 Hops\n• Cycle Suppression\n• Flow Volume Tracking", 3.6, '#1e293b', '#818cf8'),
        ("3. VASP MATCHING", "• 1,595 Verified Seeds\n• 14 Global Exchanges\n• Proof of Reserves\n• Cluster Attribution", 6.0, '#042f2e', '#2dd4bf'),
        ("4. 5-PILLAR + ML", "• Proximity Score (35%)\n• Flow Volume (25%)\n• Frequency & Recency\n• GBDT Ranker (22 Feats)", 8.4, '#1e1b4b', '#a78bfa'),
        ("5. ACTION / OUTPUT", "• Interactive Graph Studio\n• Primary Path Focus\n• Sec 91 CrPC Notice\n• LEA Compliance Route", 10.8, '#450a0a', '#f87171')
    ]

    for title, desc, cx, bg, border in boxes:
        # Draw Box
        rect = patches.FancyBboxPatch(
            (cx - 1.05, 1.8), 2.1, 3.4,
            boxstyle="round,pad=0.15,rounding_size=0.15",
            facecolor=bg, edgecolor=border, linewidth=2
        )
        ax.add_patch(rect)

        # Header Badge
        badge = patches.FancyBboxPatch(
            (cx - 0.95, 4.6), 1.9, 0.45,
            boxstyle="round,pad=0.08,rounding_size=0.08",
            facecolor=border, edgecolor='none'
        )
        ax.add_patch(badge)
        ax.text(cx, 4.82, title, ha='center', va='center', color='#0b0f19', fontsize=8.5, weight='bold')

        # Content Text
        ax.text(cx - 0.9, 3.2, desc, ha='left', va='center', color='#e2e8f0', fontsize=8, linespacing=1.6)

    # Connecting Arrows
    for cx in [2.35, 4.75, 7.15, 9.55]:
        ax.annotate("", xy=(cx + 0.15, 3.5), xytext=(cx - 0.15, 3.5),
                    arrowprops=dict(arrowstyle="->", color='#38bdf8', lw=2.5, mutation_scale=15))

    # Bottom Foundation Bar
    bot_rect = patches.FancyBboxPatch(
        (0.5, 0.4), 11.0, 0.9,
        boxstyle="round,pad=0.1,rounding_size=0.1",
        facecolor='#111827', edgecolor='#334155', linewidth=1.5
    )
    ax.add_patch(bot_rect)
    ax.text(6, 0.85, "FASTAPI ASYNC ENGINE  •  POSTGRESQL / SQLITE STORE  •  NEXT.JS 14 / CYTOSCAPE  •  NCRP TRIAGE QUEUE",
            ha='center', va='center', color='#38bdf8', fontsize=8.5, weight='bold', fontfamily='monospace')

    plt.tight_layout()
    output_path = ASSET_DIR / "architecture_diagram.png"
    plt.savefig(output_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()
    print(f"Saved: {output_path}")


def generate_five_pillars_chart():
    """Generates the 5-Pillar Attribution Formulation Graphic."""
    fig, ax = plt.subplots(figsize=(8.5, 5), dpi=300)
    fig.patch.set_facecolor('#0b0f19')
    ax.set_facecolor('#0b0f19')

    pillars = [
        "Proximity Score (S_prox)\nShortest Path Distance (d^-1)",
        "Flow Ratio (S_flow)\nVolume Entering Cluster (V_in / V_out)",
        "Interaction Frequency (S_freq)\nDirect & Indirect Tx Counts",
        "Behavioral Risk (S_behav)\nBurst Velocity & Fan-out",
        "Temporal Recency (S_rec)\nExponential Decay λ=0.01/day"
    ]
    weights = [35, 25, 15, 15, 10]
    colors = ['#38bdf8', '#2dd4bf', '#818cf8', '#f59e0b', '#ec4899']

    y_pos = range(len(pillars))
    bars = ax.barh(y_pos, weights, color=colors, height=0.6, edgecolor='#334155', linewidth=1.2)

    for bar, weight in zip(bars, weights):
        ax.text(bar.get_width() + 1.2, bar.get_y() + bar.get_height()/2, f"{weight}% Weight", 
                va='center', ha='left', color='#ffffff', fontsize=9.5, weight='bold', fontfamily='monospace')

    ax.set_yticks(y_pos)
    ax.set_yticklabels(pillars, color='#e2e8f0', fontsize=8.5, weight='medium')
    ax.set_xlim(0, 48)
    ax.set_xlabel("Pillar Weight (%) in Final Attribution Score Formula", color='#94a3b8', fontsize=9)
    ax.set_title("5-PILLAR DETERMINISTIC ATTRIBUTION SCORING ENGINE", color='#38bdf8', fontsize=11, weight='bold', pad=15)
    ax.grid(axis='x', color='#1e293b', linestyle='--', alpha=0.7)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color('#334155')
    ax.spines['bottom'].set_color('#334155')
    ax.tick_params(colors='#94a3b8')

    plt.tight_layout()
    output_path = ASSET_DIR / "five_pillars_chart.png"
    plt.savefig(output_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()
    print(f"Saved: {output_path}")


def generate_benchmark_card():
    """Generates the Offline Tri-Way Comparative Benchmark Graphic."""
    fig, ax = plt.subplots(figsize=(9, 4.5), dpi=300)
    fig.patch.set_facecolor('#0b0f19')
    ax.set_facecolor('#0b0f19')
    ax.set_xlim(0, 9)
    ax.set_ylim(0, 4.5)
    ax.axis('off')

    # Card background
    card = patches.FancyBboxPatch(
        (0.3, 0.3), 8.4, 3.9,
        boxstyle="round,pad=0.1,rounding_size=0.15",
        facecolor='#111827', edgecolor='#334155', linewidth=1.5
    )
    ax.add_patch(card)

    ax.text(4.5, 3.8, "OFFLINE TRI-WAY BENCHMARK (N = 253 HELD-OUT TEST WALLETS)",
            ha='center', va='center', color='#38bdf8', fontsize=11, weight='bold', fontfamily='monospace')

    # 3 Comparison Columns
    cols = [
        ("1. RULE BASELINE", "Top-1 Acc: 100.0%\nMacro F1: 100.0%\nLatency: <0.4ms\nDeterministic & Auditable", 1.7, '#042f2e', '#2dd4bf'),
        ("2. ML GBDT RANKER", "Top-1 Acc: 100.0%\nMacro F1: 100.0%\n22 Tabular Features\nAuxiliary Candidate Rank", 4.5, '#1e1b4b', '#a78bfa'),
        ("3. HYBRID ENSEMBLE", "Top-1 Acc: 100.0%\nMacro F1: 100.0%\n70% Rule + 30% ML\nPredictive Lift: +0.0%", 7.3, '#1e293b', '#38bdf8')
    ]

    for title, metrics, cx, bg, border in cols:
        sub_card = patches.FancyBboxPatch(
            (cx - 1.25, 0.7), 2.5, 2.7,
            boxstyle="round,pad=0.08,rounding_size=0.1",
            facecolor=bg, edgecolor=border, linewidth=1.5
        )
        ax.add_patch(sub_card)
        ax.text(cx, 3.05, title, ha='center', va='center', color=border, fontsize=9.5, weight='bold')
        ax.text(cx, 1.8, metrics, ha='center', va='center', color='#e2e8f0', fontsize=8.5, linespacing=1.8)

    plt.tight_layout()
    output_path = ASSET_DIR / "benchmark_card.png"
    plt.savefig(output_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none')
    plt.close()
    print(f"Saved: {output_path}")


if __name__ == "__main__":
    generate_architecture_diagram()
    generate_five_pillars_chart()
    generate_benchmark_card()
